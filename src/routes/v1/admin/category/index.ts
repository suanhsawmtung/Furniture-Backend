import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  getCategoryBySlugController,
  updateCategoryController,
} from "../../../../controllers/admin/category.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import { categoryNameValidation } from "../../../../validations/common.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  getAllCategoriesController
);

router.get(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  getCategoryBySlugController
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  categoryNameValidation,
  handleValidationError,
  createCategoryController
);

router.patch(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  categoryNameValidation,
  handleValidationError,
  updateCategoryController
);

router.delete(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  deleteCategoryController
);

export default router;
