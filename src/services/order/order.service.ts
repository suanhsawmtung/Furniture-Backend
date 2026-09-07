import {
  Order,
  OrderPaymentStatus,
  OrderSource,
  OrderStatus,
  ReservationStatus,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CursorPaginationResultT, ServiceResponseT } from "../../types/common";
import {
  ListOrdersParams,
  MyOrderT,
  PlaceOrderParams,
} from "../../types/order";
import {
  buildOrderWhereClause,
  enrichOrders,
  findOrderRecordByCode,
  generateOrderCode,
  parseOrderQueryParams,
} from "./order.helpers";

import { errorCode } from "../../config/error-code";
import { OrderDto } from "../../dtos/order.dto";
import { createError } from "../../utils/common";
import { findUserById } from "../user/user.helpers";
import { IOrderService } from "./order.interface";

export class OrderService implements IOrderService {
  async listMyOrders(
    userId: number,
    params: ListOrdersParams,
  ): Promise<ServiceResponseT<CursorPaginationResultT<MyOrderT>>> {
    const { pageSize, cursor, search, condition } =
      parseOrderQueryParams(params);

    const where = buildOrderWhereClause({
      ...(search && { search }),
      ...(condition && { condition }),
      userId,
      source: OrderSource.CUSTOMER,
    });

    const [items, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        take: pageSize + 1,
        ...(cursor && { cursor: { id: cursor } }),
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          code: true,
          image: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          totalPrice: true,
          customerAddress: true,
          customerName: true,
          customerNotes: true,
          customerPhone: true,
          rejectedReason: true,
          cancelledReason: true,
          payments: true,
          refunds: true,
          orderItems: {
            select: {
              quantity: true,
              price: true,
              productVariant: {
                select: {
                  size: true,
                  images: {
                    where: {
                      isPrimary: true,
                    },
                    select: {
                      path: true,
                    },
                  },
                  product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      brand: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.order.count({
        where,
      }),
    ]);

    let nextCursor: number | null = null;
    if (items.length > pageSize) {
      items.pop();
      nextCursor = items[items.length - 1]?.id || null;
    }

    return {
      success: true,
      data: {
        items: (await enrichOrders(items)).map((order) =>
          OrderDto.toOrderCard(order),
        ),
        nextCursor,
        totalCount,
      },
      message: null,
    };
  }

  async cancelMyOrder(code: string, params: { cancelledReason: string }) {
    const order = await findOrderRecordByCode(code);

    if (!order) {
      throw createError({
        message: "Order not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw createError({
        message: "Order is already cancelled.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    if (
      !([OrderStatus.PENDING, OrderStatus.ACCEPTED] as OrderStatus[]).includes(
        order.status,
      )
    ) {
      throw createError({
        message: "Order cannot be cancelled.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledReason: params.cancelledReason,
        },
      });

      const activeReservations = await tx.reservation.findMany({
        where: {
          orderId: order.id,
          status: ReservationStatus.ACTIVE,
        },
      });

      await tx.reservation.updateMany({
        where: {
          orderId: order.id,
          status: ReservationStatus.ACTIVE,
        },
        data: { status: ReservationStatus.RELEASED },
      });

      for (const reservation of activeReservations) {
        await tx.productVariant.update({
          where: { id: reservation.productVariantId },
          data: {
            reserved: { decrement: reservation.quantity },
          },
        });
      }

      return updatedOrder;
    });

    return {
      success: true,
      data: result,
      message: "Order cancelled successfully",
    };
  }

  async placeOrder(params: PlaceOrderParams): Promise<ServiceResponseT<Order>> {
    const {
      customerName,
      customerPhone,
      customerAddress,
      customerNotes,
      items,
      imageFilename,
      userId,
    } = params;

    if (!userId) {
      throw createError({
        message: "You must be logged in to create an order.",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    const orderUserId = parseInt(String(userId), 10);
    const user = await findUserById(orderUserId);
    if (!user) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    if (!items || items.length === 0) {
      throw createError({
        message: "Order items are required and must contain at least one item.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      let calculatedTotalPrice = 0;
      const verifiedItems = [];

      const variantIds = items.map((item) => Number(item.productVariantId));
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
      });

      const variantMap = new Map(variants.map((v) => [v.id, v]));

      for (const item of items) {
        const itemIdNum = Number(item.productVariantId);
        const variant = variantMap.get(itemIdNum);

        if (!variant) {
          throw createError({
            message: `Product variant not found`,
            status: 400,
            code: errorCode.notFound,
          });
        }

        const quantityNum = Number(item.quantity);
        const priceNum =
          Number(variant.discount) > 0
            ? Number(variant.discount)
            : Number(variant.price);

        calculatedTotalPrice += priceNum * quantityNum;
        verifiedItems.push({
          itemId: itemIdNum,
          quantity: quantityNum,
          price: priceNum,
        });
      }

      const order = await tx.order.create({
        data: {
          code: generateOrderCode(),
          userId: orderUserId,
          totalPrice: calculatedTotalPrice,
          source: OrderSource.CUSTOMER,
          status: OrderStatus.PENDING,
          paymentStatus: OrderPaymentStatus.UNPAID,
          customerName: customerName ? customerName.trim() : null,
          customerPhone: customerPhone ? customerPhone.trim() : null,
          customerAddress: customerAddress ? customerAddress.trim() : null,
          customerNotes: customerNotes ? customerNotes.trim() : null,
          image: imageFilename,
          orderItems: {
            create: verifiedItems.map((item) => ({
              productVariantId: item.itemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { orderItems: true },
      });

      for (const item of verifiedItems) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.itemId,
            stock: { gte: item.quantity },
          },
          data: {
            reserved: { increment: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw createError({
            message: `Product variant not found or stock is not enough`,
            status: 400,
            code: errorCode.invalid,
          });
        }

        await tx.reservation.create({
          data: {
            productVariantId: item.itemId,
            orderId: order.id,
            quantity: item.quantity,
            status: ReservationStatus.ACTIVE,
          },
        });
      }

      return order;
    });

    return {
      success: true,
      data: result,
      message: "Order created successfully.",
    };
  }
}
