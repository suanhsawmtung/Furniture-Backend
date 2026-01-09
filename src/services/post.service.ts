import { Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../lib/prisma";
import {
  CreatePostParams,
  ListPostsParams,
  ParsePostQueryParamsResult,
  UpdatePostParams,
} from "../types/post";
import { createError, createSlug, ensureUniqueSlug } from "../utils/common";
import { getFilePath, removeFile } from "../utils/file";
import { getCategoryById } from "./category.service";

export const getAllPosts = async ({
  pageSize,
  offset,
  search,
  categorySlug,
}: ListPostsParams) => {
  const whereConditions: Prisma.PostWhereInput[] = [];

  if (search) {
    whereConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        {
          author: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    });
  }

  if (categorySlug) {
    // Lightweight query: only select id field to get categoryId
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });

    if (category) {
      whereConditions.push({ categoryId: category.id });
    }
  }

  const where: Prisma.PostWhereInput =
    whereConditions.length > 0
      ? {
          AND: whereConditions,
        }
      : {};

  // Get total count for pagination
  const total = await prisma.post.count({ where });

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Calculate current page (0-based offset to 1-based page)
  const currentPage = Math.floor(offset / pageSize) + 1;

  // Fetch posts with offset pagination
  const items = await prisma.post.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { id: "desc" },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      category: true,
    },
  });

  return {
    items,
    currentPage,
    totalPages,
    pageSize,
  };
};

export const getPostBySlug = async (slug: string) => {
  return await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      category: true,
    },
  });
};

export const getPostByTitle = async (title: string) => {
  return await prisma.post.findFirst({
    where: { title },
  });
};

export const getPostByTitleExcludingId = async (
  title: string,
  excludeId: number
) => {
  return await prisma.post.findFirst({
    where: {
      title,
      NOT: { id: excludeId },
    },
  });
};

export const createPost = async (createPostData: Prisma.PostCreateInput) => {
  return await prisma.post.create({
    data: createPostData,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      category: true,
    },
  });
};

export const updatePost = async (
  id: number,
  updatePostData: Prisma.PostUpdateInput
) => {
  return await prisma.post.update({
    where: { id },
    data: updatePostData,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      category: true,
    },
  });
};

export const deletePost = async (id: number) => {
  return await prisma.post.delete({
    where: { id },
  });
};

// Validation and checking functions that call simple service functions

export const validateAndGetPostBySlug = async (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return post;
};

export const validateAndCreatePost = async (params: CreatePostParams) => {
  const {
    title,
    content,
    body,
    categoryId,
    imageFilename,
    authenticatedUserId,
  } = params;

  if (!authenticatedUserId) {
    throw createError({
      message: "User ID is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const trimmedTitle = title.trim();

  const existingByTitle = await getPostByTitle(trimmedTitle);

  if (existingByTitle) {
    throw createError({
      message: "Post with this title already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const categoryIdNum = parseInt(String(categoryId), 10);
  if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
    throw createError({
      message: "Invalid category ID.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const category = await getCategoryById(categoryIdNum);
  if (!category) {
    throw createError({
      message: "Category not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const baseSlug = createSlug(trimmedTitle);
  const slugOwner = await getPostBySlug(baseSlug);
  const slugExists = !!slugOwner;
  const slug = await ensureUniqueSlug(baseSlug, slugExists);

  const post = await createPost({
    title: trimmedTitle,
    slug,
    content: content.trim(),
    body: body.trim(),
    image: imageFilename || "",
    author: {
      connect: { id: authenticatedUserId },
    },
    category: {
      connect: { id: category.id },
    },
  });

  return post;
};

export const validateAndUpdatePost = async (
  slug: string,
  params: UpdatePostParams
) => {
  const { title, content, body, categoryId, imageFilename } = params;

  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await getPostBySlug(slug);
  if (!existing) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const trimmedTitle = title.trim();

  const existingByTitle = await getPostByTitleExcludingId(
    trimmedTitle,
    existing.id
  );
  if (existingByTitle) {
    throw createError({
      message: "Post with this title already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const categoryIdNum = parseInt(String(categoryId), 10);
  if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
    throw createError({
      message: "Invalid category ID.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const category = await getCategoryById(categoryIdNum);
  if (!category) {
    throw createError({
      message: "Category not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const baseSlug = createSlug(trimmedTitle);
  const slugOwner = await getPostBySlug(baseSlug);
  const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
  const newSlug = await ensureUniqueSlug(baseSlug, slugExists);

  const updateData: any = {
    title: trimmedTitle,
    slug: newSlug,
    content: content.trim(),
    body: body.trim(),
    category: {
      connect: { id: category.id },
    },
  };

  if (imageFilename) {
    if (existing.image) {
      const oldImagePath = getFilePath(
        "uploads",
        "images",
        "post",
        existing.image
      );
      removeFile(oldImagePath);
    }
    updateData.image = imageFilename;
  }

  const post = await updatePost(existing.id, updateData);

  return post;
};

export const validateAndDeletePost = async (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await getPostBySlug(slug);
  if (!existing) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  if (existing.image) {
    const imagePath = getFilePath("uploads", "images", "post", existing.image);
    removeFile(imagePath);
  }

  await deletePost(existing.id);
};

export const parsePostQueryParams = (
  query: any
): ParsePostQueryParamsResult => {
  const pageSizeParam = Number(query.limit);
  const pageSize =
    Number.isNaN(pageSizeParam) || pageSizeParam <= 0
      ? 10
      : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search =
    typeof query.search === "string" && query.search.trim().length > 0
      ? query.search.trim()
      : undefined;

  const categorySlug =
    typeof query.category === "string" && query.category.trim().length > 0
      ? query.category.trim()
      : undefined;

  return {
    pageSize,
    offset,
    search,
    categorySlug,
  };
};
