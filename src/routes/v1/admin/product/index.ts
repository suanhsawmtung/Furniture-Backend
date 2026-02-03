import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createProduct,
  createProductVariant,
  deleteProduct,
  deleteProductVariant,
  getProduct,
  getProductVariant,
  listProducts,
  listProductVariants,
  updateProduct,
  updateProductVariant,
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
  createProductVariantValidation,
  updateProductValidation,
  updateProductVariantValidation,
} from "../../../../validations/product.validation";

const router: Router = express.Router();

router.get("/", isAuthenticated, permit(true, Role.ADMIN), listProducts);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  // uploadProductImages,
  // handleMulterError,
  createProductValidation,
  handleValidationError,
  createProduct
);

router.get("/:slug", isAuthenticated, permit(true, Role.ADMIN), getProduct);

router.patch(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  // uploadProductImages,
  // handleMulterError,
  updateProductValidation,
  handleValidationError,
  updateProduct
);

router.delete(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  deleteProduct
);

router.get(
  "/:slug/variants",
  isAuthenticated,
  permit(true, Role.ADMIN),
  listProductVariants
);

router.get(
  "/:slug/variants/:variantSlug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getProductVariant
);

router.post(
  "/:slug/variants/create",
  isAuthenticated,
  permit(true, Role.ADMIN),
  uploadProductImages,
  handleMulterError,
  createProductVariantValidation,
  handleValidationError,
  createProductVariant
);

router.patch(
  "/:slug/variants/:variantSlug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  uploadProductImages,
  handleMulterError,
  updateProductVariantValidation,
  handleValidationError,
  updateProductVariant
);

router.delete(
  "/:slug/variants/:variantSlug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  deleteProductVariant
);

export default router;
