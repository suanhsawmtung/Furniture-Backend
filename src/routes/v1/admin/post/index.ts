import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  updatePost
} from "../../../../controllers/admin/post.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import {
  handleMulterError,
  uploadPostImage,
} from "../../../../middlewares/file-upload";
import {
  createPostValidation,
  updatePostValidation,
} from "../../../../validations/post.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  listPosts
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  uploadPostImage,
  handleMulterError,
  createPostValidation,
  handleValidationError,
  createPost
);

router.get(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  getPost
);

router.patch(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  uploadPostImage,
  handleMulterError,
  updatePostValidation,
  handleValidationError,
  updatePost
);

router.delete(
  "/:slug",
  isAuthenticated,
  permit(true, Role.ADMIN, Role.AUTHOR),
  deletePost
);

export default router;


