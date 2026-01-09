import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import {
  getAllMaterials,
  parseMaterialQueryParams,
  validateAndCreateMaterial,
  validateAndDeleteMaterial,
  validateAndGetMaterialBySlug,
  validateAndUpdateMaterial,
} from "../../services/material.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const getAllMaterialsController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseMaterialQueryParams(req.query);

    const {
      items: materials,
      currentPage,
      totalPages,
      pageSize,
    } = await getAllMaterials(queryParams);

    res.status(200).json({
      success: true,
      data: {
        materials,
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

export const getMaterialBySlugController = async (
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

    const material = await validateAndGetMaterialBySlug(slug);

    res.status(200).json({
      success: true,
      data: { material },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createMaterialController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const material = await validateAndCreateMaterial({ name });

    res.status(201).json({
      success: true,
      data: { material },
      message: "Material created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateMaterialController = async (
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

    const material = await validateAndUpdateMaterial(slug, { name });

    res.status(200).json({
      success: true,
      data: { material },
      message: "Material updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteMaterialController = async (
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

    await validateAndDeleteMaterial(slug);

    res.status(200).json({
      success: true,
      data: null,
      message: "Material deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
