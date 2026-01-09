import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import {
  getAllTypes,
  parseTypeQueryParams,
  validateAndCreateType,
  validateAndDeleteType,
  validateAndGetTypeBySlug,
  validateAndUpdateType,
} from "../../services/type.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const getAllTypesController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseTypeQueryParams(req.query);

    const {
      items: types,
      currentPage,
      totalPages,
      pageSize,
    } = await getAllTypes(queryParams);

    res.status(200).json({
      success: true,
      data: {
        types,
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

export const getTypeBySlugController = async (
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

    const type = await validateAndGetTypeBySlug(slug);

    res.status(200).json({
      success: true,
      data: { type },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createTypeController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const type = await validateAndCreateType({ name });

    res.status(201).json({
      success: true,
      data: { type },
      message: "Type created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateTypeController = async (
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

    const type = await validateAndUpdateType(slug, { name });

    res.status(200).json({
      success: true,
      data: { type },
      message: "Type updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteTypeController = async (
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

    await validateAndDeleteType(slug);

    res.status(200).json({
      success: true,
      data: null,
      message: "Type deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
