import { Role } from "@prisma/client";
import express, { Router } from "express";
import { uploadProfile } from "../../../../controllers/common/profile.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import {
  handleMulterError,
  uploadProfileImage,
} from "../../../../middlewares/file-upload";

const router: Router = express.Router();

router.patch(
  "/upload-profile",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR, Role.USER),
  uploadProfileImage,
  handleMulterError,
  uploadProfile
);

export default router;
