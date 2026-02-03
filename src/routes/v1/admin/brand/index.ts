import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createBrand,
  deleteBrand,
  getBrand,
  listBrands,
  updateBrand,
} from "../../../../controllers/admin/brand.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import { brandNameValidation } from "../../../../validations/common.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  listBrands
);

router.get(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getBrand
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  brandNameValidation,
  handleValidationError,
  createBrand
);

router.patch(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  brandNameValidation,
  handleValidationError,
  updateBrand
);

router.delete(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  deleteBrand
);

export default router;
