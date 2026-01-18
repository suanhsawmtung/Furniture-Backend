import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../lib/prisma";
import { generateCode } from "../lib/unique-key-generator";
import {
  CreateOrderParams,
  ListOrdersParams,
  ParseOrderQueryParamsResult,
  UpdateOrderParams,
} from "../types/order";
import { createError } from "../utils/common";
import { getProductById } from "./product.service";
import { findUserById } from "./user/user.helpers";

export const getAllOrders = async ({
  pageSize,
  offset,
  search,
  status,
  paymentStatus,
  userId,
}: ListOrdersParams) => {
  const whereConditions: Prisma.OrderWhereInput[] = [];

  if (search) {
    whereConditions.push({
      OR: [
        { code: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (status) {
    whereConditions.push({ status });
  }

  if (paymentStatus) {
    whereConditions.push({ paymentStatus });
  }

  if (userId) {
    whereConditions.push({ userId });
  }

  const where: Prisma.OrderWhereInput =
    whereConditions.length > 0
      ? {
          AND: whereConditions,
        }
      : {};

  // Get total count for pagination
  const total = await prisma.order.count({ where });

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Calculate current page (0-based offset to 1-based page)
  const currentPage = Math.floor(offset / pageSize) + 1;

  // Fetch orders with offset pagination
  const items = await prisma.order.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { id: "desc" },
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      products: {
        include: {
          product: {
            include: {
              material: true,
              type: true,
              images: true,
            },
          },
        },
      },
    },
  });

  return {
    items,
    currentPage,
    totalPages,
    pageSize,
  };
};

export const getOrderByCode = async (code: string) => {
  return await prisma.order.findUnique({
    where: { code },
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      products: {
        include: {
          product: {
            include: {
              material: true,
              type: true,
              images: true,
            },
          },
        },
      },
    },
  });
};

export const getOrderById = async (id: number) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      products: {
        include: {
          product: {
            include: {
              material: true,
              type: true,
              images: true,
            },
          },
        },
      },
    },
  });
};

export const getOrderByCodeExcludingId = async (
  code: string,
  excludeId: number
) => {
  return await prisma.order.findFirst({
    where: {
      code,
      NOT: { id: excludeId },
    },
  });
};

export const createOrder = async (createOrderData: Prisma.OrderCreateInput) => {
  return await prisma.order.create({
    data: createOrderData,
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      products: {
        include: {
          product: {
            include: {
              material: true,
              type: true,
              images: true,
            },
          },
        },
      },
    },
  });
};

export const updateOrder = async (
  id: number,
  updateOrderData: Prisma.OrderUpdateInput
) => {
  return await prisma.order.update({
    where: { id },
    data: updateOrderData,
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      products: {
        include: {
          product: {
            include: {
              material: true,
              type: true,
              images: true,
            },
          },
        },
      },
    },
  });
};

export const deleteOrder = async (id: number) => {
  return await prisma.order.delete({
    where: { id },
  });
};

export const getOrderProducts = async (orderId: number) => {
  return await prisma.productsOnOrders.findMany({
    where: { orderId },
    include: {
      product: true,
    },
  });
};

export const createOrderProduct = async (
  orderId: number,
  productId: number,
  quantity: number,
  price: number
) => {
  return await prisma.productsOnOrders.create({
    data: {
      orderId,
      productId,
      quantity,
      price,
    },
  });
};

export const deleteOrderProducts = async (orderId: number) => {
  return await prisma.productsOnOrders.deleteMany({
    where: { orderId },
  });
};

// Generate unique order code (max 15 characters)
const generateOrderCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomCode = generateCode(2).toUpperCase(); // 2 bytes = 4 hex chars
  // Format: {timestamp}{randomCode} (e.g., "LIRX9K2A" = 8 chars)
  return `${timestamp}${randomCode}`;
};

// Validation and checking functions that call simple service functions

export const validateAndGetOrderByCode = async (code: string) => {
  if (!code || code.trim().length === 0) {
    throw createError({
      message: "Order code parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const order = await getOrderByCode(code);

  if (!order) {
    throw createError({
      message: "Order not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return order;
};

export const validateAndCreateOrder = async (params: CreateOrderParams) => {
  const {
    totalPrice,
    status,
    paymentStatus,
    customerName,
    customerPhone,
    customerAddress,
    customerNotes,
    products,
    userId,
    authenticatedUserId,
  } = params;

  // Validate userId if provided, otherwise use authenticated user
  let orderUserId: number;
  if (userId) {
    const userIdNum = parseInt(String(userId), 10);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      throw createError({
        message: "Invalid user ID.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const user = await findUserById(userIdNum);
    if (!user) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }
    orderUserId = userIdNum;
  } else {
    // Use authenticated user
    if (!authenticatedUserId) {
      throw createError({
        message: "User ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }
    orderUserId = authenticatedUserId;
  }

  // Validate products
  if (!Array.isArray(products) || products.length === 0) {
    throw createError({
      message:
        "Products array is required and must contain at least one product.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Validate each product exists
  for (const productItem of products) {
    const productId = parseInt(String(productItem.productId), 10);
    if (isNaN(productId) || productId <= 0) {
      throw createError({
        message: "Invalid product ID in products array.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const product = await getProductById(productId);
    if (!product) {
      throw createError({
        message: `Product with ID ${productId} not found.`,
        status: 404,
        code: errorCode.notFound,
      });
    }
  }

  // Generate unique order code
  let orderCode = generateOrderCode();
  let codeExists = await getOrderByCode(orderCode);
  while (codeExists) {
    orderCode = generateOrderCode();
    codeExists = await getOrderByCode(orderCode);
  }

  // Create order using simple service function
  const order = await createOrder({
    code: orderCode,
    totalPrice: parseFloat(String(totalPrice)),
    status: status || OrderStatus.PENDING,
    paymentStatus: paymentStatus || PaymentStatus.UNPAID,
    customerName: customerName ? customerName.trim() : null,
    customerPhone: customerPhone ? customerPhone.trim() : null,
    customerAddress: customerAddress ? customerAddress.trim() : null,
    customerNotes: customerNotes ? customerNotes.trim() : null,
    User: {
      connect: { id: orderUserId },
    },
    products: {
      create: products.map((productItem) => ({
        productId: parseInt(String(productItem.productId), 10),
        quantity: parseInt(String(productItem.quantity), 10),
        price: parseFloat(String(productItem.price)),
      })),
    },
  });

  return order;
};

export const validateAndUpdateOrder = async (
  code: string,
  params: UpdateOrderParams
) => {
  const {
    totalPrice,
    status,
    paymentStatus,
    customerName,
    customerPhone,
    customerAddress,
    customerNotes,
    rejectedReason,
    products,
    userId,
  } = params;

  if (!code || code.trim().length === 0) {
    throw createError({
      message: "Order code parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Check if order exists
  const existing = await getOrderByCode(code);
  if (!existing) {
    throw createError({
      message: "Order not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const updateData: any = {};

  if (totalPrice !== undefined) {
    updateData.totalPrice = parseFloat(String(totalPrice));
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  if (paymentStatus !== undefined) {
    updateData.paymentStatus = paymentStatus;
  }

  if (customerName !== undefined) {
    updateData.customerName = customerName.trim();
  }

  if (customerPhone !== undefined) {
    updateData.customerPhone = customerPhone.trim();
  }

  if (customerAddress !== undefined) {
    updateData.customerAddress = customerAddress.trim();
  }

  if (customerNotes !== undefined) {
    updateData.customerNotes = customerNotes.trim();
  }

  if (rejectedReason !== undefined) {
    updateData.rejectedReason = rejectedReason.trim();
  }

  // Validate rejectedReason when status is REJECTED
  if (status === OrderStatus.REJECTED) {
    if (!rejectedReason || rejectedReason.trim().length === 0) {
      throw createError({
        message: "Rejected reason is required when status is REJECTED.",
        status: 400,
        code: errorCode.invalid,
      });
    }
  }

  // Update userId if provided
  if (userId !== undefined) {
    const userIdNum = parseInt(String(userId), 10);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      throw createError({
        message: "Invalid user ID.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const user = await findUserById(userIdNum);
    if (!user) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }
    updateData.User = { connect: { id: userIdNum } };
  }

  // Update products if provided
  if (products && Array.isArray(products)) {
    // Validate products
    for (const productItem of products) {
      const productId = parseInt(String(productItem.productId), 10);
      if (isNaN(productId) || productId <= 0) {
        throw createError({
          message: "Invalid product ID in products array.",
          status: 400,
          code: errorCode.invalid,
        });
      }

      const product = await getProductById(productId);
      if (!product) {
        throw createError({
          message: `Product with ID ${productId} not found.`,
          status: 404,
          code: errorCode.notFound,
        });
      }
    }

    // Delete existing products and create new ones
    await deleteOrderProducts(existing.id);
    updateData.products = {
      create: products.map((productItem) => ({
        productId: parseInt(String(productItem.productId), 10),
        quantity: parseInt(String(productItem.quantity), 10),
        price: parseFloat(String(productItem.price)),
      })),
    };
  }

  // Update order using simple service function
  const order = await updateOrder(existing.id, updateData);

  return order;
};

export const validateAndDeleteOrder = async (code: string) => {
  if (!code || code.trim().length === 0) {
    throw createError({
      message: "Order code parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Check if order exists
  const existing = await getOrderByCode(code);
  if (!existing) {
    throw createError({
      message: "Order not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  // Delete order using simple service function
  await deleteOrder(existing.id);
};

export const parseOrderQueryParams = (
  query: any
): ParseOrderQueryParamsResult => {
  const pageSizeParam = Number(query.pageSize);
  const pageSize =
    Number.isNaN(pageSizeParam) || pageSizeParam <= 0
      ? 10
      : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search =
    typeof query.search === "string" && query.search.trim().length > 0
      ? query.search.trim()
      : undefined;

  let status: OrderStatus | undefined;
  if (typeof query.status === "string") {
    const statusValue = query.status.toUpperCase();
    if (Object.values(OrderStatus).includes(statusValue as OrderStatus)) {
      status = statusValue as OrderStatus;
    }
  }

  let paymentStatus: PaymentStatus | undefined;
  if (typeof query.paymentStatus === "string") {
    const paymentStatusValue = query.paymentStatus.toUpperCase();
    if (
      Object.values(PaymentStatus).includes(paymentStatusValue as PaymentStatus)
    ) {
      paymentStatus = paymentStatusValue as PaymentStatus;
    }
  }

  let userId: number | undefined;
  if (typeof query.userId === "string") {
    const parsedUserId = Number(query.userId);
    if (!isNaN(parsedUserId) && parsedUserId > 0) {
      userId = parsedUserId;
    }
  }

  return {
    pageSize,
    offset,
    search,
    status,
    paymentStatus,
    userId,
  };
};
