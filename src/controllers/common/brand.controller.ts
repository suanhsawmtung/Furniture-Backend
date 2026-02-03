import { NextFunction, Response } from "express";
import { listPublicBrands as listPublicBrandsService } from "../../services/brand/brand.service";
import { CustomRequest } from "../../types/common";

export const listPublicBrands = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const brands = await listPublicBrandsService();

    res.status(200).json({
      success: true,
      data: {
        brands,
      },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};
