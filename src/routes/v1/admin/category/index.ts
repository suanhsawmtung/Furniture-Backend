import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
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
  listCategories
);

router.get(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  getCategory
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  categoryNameValidation,
  handleValidationError,
  createCategory
);

router.patch(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  categoryNameValidation,
  handleValidationError,
  updateCategory
);

router.delete(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  deleteCategory
);

export default router;
