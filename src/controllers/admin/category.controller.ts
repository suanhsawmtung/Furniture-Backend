import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import {
  getAllCategories,
  parseCategoryQueryParams,
  validateAndCreateCategory,
  validateAndDeleteCategory,
  validateAndGetCategoryBySlug,
  validateAndUpdateCategory,
} from "../../services/category.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const getAllCategoriesController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseCategoryQueryParams(req.query);

    const {
      items: categories,
      currentPage,
      totalPages,
      pageSize,
    } = await getAllCategories(queryParams);

    res.status(200).json({
      success: true,
      data: {
        categories,
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

export const getCategoryBySlugController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const category = await validateAndGetCategoryBySlug(slug);

    res.status(200).json({
      success: true,
      data: { category },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createCategoryController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const category = await validateAndCreateCategory({ name });

    res.status(201).json({
      success: true,
      data: { category },
      message: "Category created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateCategoryController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { name } = req.body;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const category = await validateAndUpdateCategory(slug, {
      name,
    });

    res.status(200).json({
      success: true,
      data: { category },
      message: "Category updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteCategoryController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    await validateAndDeleteCategory(slug);

    res.status(200).json({
      success: true,
      data: null,
      message: "Category deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
