import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  getUserByIdController,
  getUserByUsernameController,
  updateUserController,
  updateUserRoleController,
  updateUserStatusController,
} from "../../../../controllers/admin/user.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import {
  createUserValidation,
  updateUserRoleValidation,
  updateUserStatusValidation,
  updateUserValidation,
} from "../../../../validations/user.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getAllUsersController
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  createUserValidation,
  handleValidationError,
  createUserController
);

router.get(
  "/:id",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getUserByIdController
);

router.get(
  "/username/:username",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getUserByUsernameController
);

router.patch(
  "/:username",
  isAuthenticated,
  permit(true, Role.ADMIN),
  updateUserValidation,
  handleValidationError,
  updateUserController
);

router.patch(
  "/:username/role",
  isAuthenticated,
  permit(true, Role.ADMIN),
  updateUserRoleValidation,
  handleValidationError,
  updateUserRoleController
);

router.patch(
  "/:username/status",
  isAuthenticated,
  permit(true, Role.ADMIN),
  updateUserStatusValidation,
  handleValidationError,
  updateUserStatusController
);

router.delete(
  "/:username",
  isAuthenticated,
  permit(true, Role.ADMIN),
  deleteUserController
);

export default router;
