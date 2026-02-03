import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import { parseBrandQueryParams } from "../../services/brand/brand.helpers";
import * as BrandService from "../../services/brand/brand.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const listBrands = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseBrandQueryParams(req.query);

    const {
      items: brands,
      currentPage,
      totalPages,
      pageSize,
    } = await BrandService.listBrands(queryParams);

    res.status(200).json({
      success: true,
      data: {
        brands,
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

export const getBrand = async (
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

    const brand = await BrandService.getBrandDetail(slug);

    res.status(200).json({
      success: true,
      data: { brand },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createBrand = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const brand = await BrandService.createBrand({ name });

    res.status(201).json({
      success: true,
      data: { brand },
      message: "Brand created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateBrand = async (
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

    const brand = await BrandService.updateBrand(slug, {
      name,
    });

    res.status(200).json({
      success: true,
      data: { brand },
      message: "Brand updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteBrand = async (
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

    await BrandService.deleteBrand(slug);

    res.status(200).json({
      success: true,
      data: null,
      message: "Brand deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
