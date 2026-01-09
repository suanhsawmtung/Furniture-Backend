import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import {
  getAllOrders,
  parseOrderQueryParams,
  validateAndCreateOrder,
  validateAndDeleteOrder,
  validateAndGetOrderByCode,
  validateAndUpdateOrder,
} from "../../services/order.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const getAllOrdersController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseOrderQueryParams(req.query);

    const {
      items: orders,
      currentPage,
      totalPages,
      pageSize,
    } = await getAllOrders(queryParams);

    res.status(200).json({
      success: true,
      data: {
        orders,
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getOrderByCodeController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    if (!code) {
      const error = createError({
        message: "Order code is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const order = await validateAndGetOrderByCode(code);

    res.status(200).json({
      success: true,
      data: { order },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createOrderController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
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
    } = req.body;

    const order = await validateAndCreateOrder({
      totalPrice,
      status,
      paymentStatus,
      customerName,
      customerPhone,
      customerAddress,
      customerNotes,
      products,
      userId,
      ...(req.userId && { authenticatedUserId: req.userId }),
    });

    res.status(201).json({
      success: true,
      data: { order },
      message: "Order created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateOrderController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    if (!code) {
      const error = createError({
        message: "Order code is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

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
    } = req.body;

    const order = await validateAndUpdateOrder(code, {
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
    });

    res.status(200).json({
      success: true,
      data: { order },
      message: "Order updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteOrderController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    if (!code) {
      const error = createError({
        message: "Order code is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    await validateAndDeleteOrder(code);

    res.status(200).json({
      success: true,
      data: null,
      message: "Order deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
