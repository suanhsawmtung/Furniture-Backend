import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from "../../../../controllers/admin/user.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { ensureNotSelfUser } from "../../../../middlewares/ensure-not-self-user";
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
  listUsers
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  createUserValidation,
  handleValidationError,
  createUser
);

// router.get(
//   "/:id",
//   isAuthenticated,
//   permit(true, Role.ADMIN),
//   getUserById
// );

router.get(
  "/:username",
  isAuthenticated,
  permit(true, Role.ADMIN),
  ensureNotSelfUser,
  getUser
);

router.patch(
  "/:username",
  isAuthenticated,
  permit(true, Role.ADMIN),
  ensureNotSelfUser,
  updateUserValidation,
  handleValidationError,
  updateUser
);

router.patch(
  "/:username/role",
  isAuthenticated,
  permit(true, Role.ADMIN),
  ensureNotSelfUser,
  updateUserRoleValidation,
  handleValidationError,
  updateUserRole
);

router.patch(
  "/:username/status",
  isAuthenticated,
  permit(true, Role.ADMIN),
  ensureNotSelfUser,
  updateUserStatusValidation,
  handleValidationError,
  updateUserStatus
);

router.delete(
  "/:username",
  isAuthenticated,
  permit(true, Role.ADMIN),
  ensureNotSelfUser,
  deleteUser
);

export default router;
