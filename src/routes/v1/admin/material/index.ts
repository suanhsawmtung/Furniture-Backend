import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createMaterialController,
  deleteMaterialController,
  getAllMaterialsController,
  getMaterialBySlugController,
  updateMaterialController,
} from "../../../../controllers/admin/material.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import { materialNameValidation } from "../../../../validations/common.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getAllMaterialsController
);

router.get(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getMaterialBySlugController
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  materialNameValidation,
  handleValidationError,
  createMaterialController
);

router.patch(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  materialNameValidation,
  handleValidationError,
  updateMaterialController
);

router.delete(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN),
  deleteMaterialController
);

export default router;
