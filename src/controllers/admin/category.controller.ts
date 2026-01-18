import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import { parseCategoryQueryParams } from "../../services/category/category.helpers";
import * as CategoryService from "../../services/category/category.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const listCategories = async (
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
    } = await CategoryService.listCategories(queryParams);

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

export const getCategory = async (
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

    const category = await CategoryService.getCategoryDetail(slug);

    res.status(200).json({
      success: true,
      data: { category },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createCategory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const category = await CategoryService.createCategory({ name });

    res.status(201).json({
      success: true,
      data: { category },
      message: "Category created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateCategory = async (
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

    const category = await CategoryService.updateCategory(slug, {
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

export const deleteCategory = async (
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

    await CategoryService.deleteCategory(slug);

    res.status(200).json({
      success: true,
      data: null,
      message: "Category deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
