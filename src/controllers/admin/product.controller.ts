import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import {
  getAllProducts,
  parseProductQueryParams,
  validateAndCreateProduct,
  validateAndDeleteProduct,
  validateAndGetProductBySlug,
  validateAndUpdateProduct,
} from "../../services/product.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";
import { cleanupUploadedFiles } from "../../utils/file-cleanup";

export const getAllProductsController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseProductQueryParams(req.query);

    const {
      items: products,
      currentPage,
      totalPages,
      pageSize,
    } = await getAllProducts(queryParams);

    res.status(200).json({
      success: true,
      data: {
        products,
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

export const getProductBySlugController = async (
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

    const product = await validateAndGetProductBySlug(slug);

    res.status(200).json({
      success: true,
      data: { product },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createProductController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      inventory,
      status,
      materialId,
      typeId,
    } = req.body;

    const files = (req as any).files as Express.Multer.File[] | undefined;
    const imageFilenames =
      files && Array.isArray(files) ? files.map((file) => file.filename) : [];

    const product = await validateAndCreateProduct({
      name,
      description,
      price,
      discount,
      inventory,
      status,
      materialId,
      typeId,
      ...(imageFilenames.length > 0 && { imageFilenames }),
    });

    (req as any).uploadedFiles = [];

    res.status(201).json({
      success: true,
      data: { product },
      message: "Product created successfully.",
    });
  } catch (error: any) {
    await cleanupUploadedFiles(req);
    next(error);
  }
};

export const updateProductController = async (
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
      await cleanupUploadedFiles(req);
      return next(error);
    }

    const {
      name,
      description,
      price,
      discount,
      inventory,
      status,
      materialId,
      typeId,
      imageIds,
    } = req.body;

    const files = (req as any).files as Express.Multer.File[] | undefined;
    const imageFilenames =
      files && Array.isArray(files) ? files.map((file) => file.filename) : [];

    const product = await validateAndUpdateProduct(slug, {
      name,
      description,
      price,
      discount,
      inventory,
      status,
      materialId,
      typeId,
      ...(imageFilenames.length > 0 && { imageFilenames }),
      ...(imageIds && { imageIds }),
    });

    (req as any).uploadedFiles = [];

    res.status(200).json({
      success: true,
      data: { product },
      message: "Product updated successfully.",
    });
  } catch (error: any) {
    await cleanupUploadedFiles(req);
    next(error);
  }
};

export const deleteProductController = async (
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

    await validateAndDeleteProduct(slug);

    res.status(200).json({
      success: true,
      data: null,
      message: "Product deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
