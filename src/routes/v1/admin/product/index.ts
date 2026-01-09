import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductBySlugController,
  updateProductController,
} from "../../../../controllers/admin/product.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import {
  handleMulterError,
  uploadProductImages,
} from "../../../../middlewares/file-upload";
import {
  createProductValidation,
  updateProductValidation,
} from "../../../../validations/product.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getAllProductsController
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  uploadProductImages,
  handleMulterError,
  createProductValidation,
  handleValidationError,
  createProductController
);

router.get(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getProductBySlugController
);

router.patch(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  uploadProductImages,
  handleMulterError,
  updateProductValidation,
  handleValidationError,
  updateProductController
);

router.delete(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  deleteProductController
);

export default router;
