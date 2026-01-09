import { NextFunction, Response } from "express";
import { getAllCategoriesSimple } from "../../services/category.service";
import { CustomRequest } from "../../types/common";

export const getAllCategoriesController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getAllCategoriesSimple();

    res.status(200).json({
      success: true,
      data: {
        categories,
      },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};
