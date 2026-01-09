import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createTypeController,
  deleteTypeController,
  getAllTypesController,
  getTypeBySlugController,
  updateTypeController,
} from "../../../../controllers/admin/type.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import { typeNameValidation } from "../../../../validations/common.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getAllTypesController
);

router.get(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getTypeBySlugController
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  typeNameValidation,
  handleValidationError,
  createTypeController
);

router.patch(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  typeNameValidation,
  handleValidationError,
  updateTypeController
);

router.delete(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  deleteTypeController
);

export default router;
