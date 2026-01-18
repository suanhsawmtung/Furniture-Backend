import { NextFunction, Response } from "express";
import { listPublicCategories as listPublicCategoriesService } from "../../services/category/category.service";
import { CustomRequest } from "../../types/common";

export const listPublicCategories = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await listPublicCategoriesService();

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
