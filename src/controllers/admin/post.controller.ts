import { PostStatus } from "@prisma/client";
import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import { parsePostQueryParams } from "../../services/post/post.helpers";
import * as PostService from "../../services/post/post.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";
import { cleanupUploadedFiles } from "../../utils/file-cleanup";

export const listPosts = async (
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
    } = await PostService.listPosts({
      ...queryParams,
      ...(req.userId ? { authenticatedUserId: req.userId } : {}),
    });

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

export const getPost = async (
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

    const post = await PostService.getPostDetail(slug, req.userId);

    res.status(200).json({
      success: true,
      data: { post },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createPost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, excerpt, content, categoryId } = req.body;
    const file = (req as any).file as Express.Multer.File | undefined;

    const post = await PostService.createPost({
      title,
      excerpt,
      content,
      status: PostStatus.DRAFT,
      categoryId,
      ...(file?.filename && { imageFilename: file.filename }),
      ...(req.userId ? { authenticatedUserId: req.userId } : {}),
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

export const updatePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { title, excerpt, content, status, categoryId } = req.body;
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

    const post = await PostService.updatePost(slug, {
      title,
      excerpt,
      content,
      status,
      categoryId,
      ...(file?.filename && { imageFilename: file.filename }),
      ...(req.userId ? { authenticatedUserId: req.userId } : {}),
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

export const deletePost = async (
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

    await PostService.deletePost(slug, req.userId);

    res.status(200).json({
      success: true,
      data: null,
      message: "Post deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
