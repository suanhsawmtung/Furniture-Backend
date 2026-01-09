import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import {
  getAllPosts,
  parsePostQueryParams,
  validateAndCreatePost,
  validateAndDeletePost,
  validateAndGetPostBySlug,
  validateAndUpdatePost,
} from "../../services/post.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";
import { cleanupUploadedFiles } from "../../utils/file-cleanup";

export const getAllPostsController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parsePostQueryParams(req.query);

    const {
      items: posts,
      currentPage,
      totalPages,
      pageSize,
    } = await getAllPosts(queryParams);

    res.status(200).json({
      success: true,
      data: {
        posts,
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getPostBySlugController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const post = await validateAndGetPostBySlug(slug);

    res.status(200).json({
      success: true,
      data: { post },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createPostController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, content, body, categoryId } = req.body;
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!req.userId) {
      await cleanupUploadedFiles(req);
      const error = createError({
        message: "User ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const post = await validateAndCreatePost({
      title,
      content,
      body,
      categoryId,
      ...(file?.filename && { imageFilename: file.filename }),
      authenticatedUserId: req.userId,
    });

    (req as any).uploadedFiles = [];

    res.status(201).json({
      success: true,
      data: { post },
      message: "Post created successfully.",
    });
  } catch (error: any) {
    await cleanupUploadedFiles(req);
    next(error);
  }
};

export const updatePostController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { title, content, body, categoryId } = req.body;
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      await cleanupUploadedFiles(req);
      return next(error);
    }

    const post = await validateAndUpdatePost(slug, {
      title,
      content,
      body,
      categoryId,
      ...(file?.filename && { imageFilename: file.filename }),
    });

    (req as any).uploadedFiles = [];

    res.status(200).json({
      success: true,
      data: { post },
      message: "Post updated successfully.",
    });
  } catch (error: any) {
    await cleanupUploadedFiles(req);
    next(error);
  }
};

export const deletePostController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    await validateAndDeletePost(slug);

    res.status(200).json({
      success: true,
      data: null,
      message: "Post deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
