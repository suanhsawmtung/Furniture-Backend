import { PostStatus, Prisma, Role } from "@prisma/client";
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
import { getUserRoleById } from "./user.service";

export const getAllPosts = async ({
  pageSize,
  offset,
  search,
  categorySlug,
  status,
  authenticatedUserId,
}: ListPostsParams) => {
  const whereConditions: Prisma.PostWhereInput[] = [];

  const userId = requireAuthenticatedUserId(authenticatedUserId);
  const role = await getRoleOrThrow(userId);

  if (search) {
    whereConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
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

  if (status) {
    const shouldApplyStatus =
      status !== PostStatus.ARCHIVED || role === Role.ADMIN;
    if (shouldApplyStatus) {
      whereConditions.push({ status });
    }
  }

  if (role !== Role.ADMIN) {
    whereConditions.push({ authorId: userId });
    whereConditions.push({ status: { not: PostStatus.ARCHIVED } });
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

export const validateAndGetPostBySlug = async (
  slug: string,
  authenticatedUserId?: number
) => {
  const normalizedSlug = requireSlug(slug);
  const userId = requireAuthenticatedUserId(authenticatedUserId);
  const role = await getRoleOrThrow(userId);
  const post = await getPostBySlug(normalizedSlug);

  if (!post) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  assertPostReadable(post, role, userId);

  return post;
};

export const validateAndCreatePost = async (params: CreatePostParams) => {
  const {
    title,
    excerpt,
    content,
    status,
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

  const normalizedStatus = status ?? PostStatus.DRAFT;

  const post = await createPost({
    title: trimmedTitle,
    slug,
    excerpt: excerpt.trim(),
    content: content.trim(),
    image: imageFilename || "",
    status: normalizedStatus,
    publishedAt: normalizedStatus === PostStatus.PUBLISHED ? new Date() : null,
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
  const {
    title,
    excerpt,
    content,
    status,
    categoryId,
    imageFilename,
    authenticatedUserId,
  } = params;

  const normalizedSlug = requireSlug(slug);
  const userId = requireAuthenticatedUserId(authenticatedUserId);
  const role = await getRoleOrThrow(userId);
  const existing = await getPostBySlug(normalizedSlug);
  if (!existing) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  assertPostMutable(existing, role, userId, "Not allowed to update this post.");

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
    excerpt: excerpt.trim(),
    content: content.trim(),
    category: {
      connect: { id: category.id },
    },
  };

  if (status) {
    updateData.status = status;
    if (status === PostStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    }
  }

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

export const validateAndDeletePost = async (
  slug: string,
  authenticatedUserId?: number
) => {
  const normalizedSlug = requireSlug(slug);
  const userId = requireAuthenticatedUserId(authenticatedUserId);
  const role = await getRoleOrThrow(userId);
  const existing = await getPostBySlug(normalizedSlug);
  if (!existing) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  assertPostMutable(existing, role, userId, "Not allowed to delete this post.");

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

  let status: PostStatus | undefined;
  if (typeof query.status === "string") {
    const statusValue = query.status.trim();
    if (Object.values(PostStatus).includes(statusValue as PostStatus)) {
      status = statusValue as PostStatus;
    }
  }

  return {
    pageSize,
    offset,
    search,
    categorySlug,
    status,
  };
};

const requireSlug = (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return slug.trim();
};

const requireAuthenticatedUserId = (authenticatedUserId?: number) => {
  if (!authenticatedUserId) {
    throw createError({
      message: "User ID is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return authenticatedUserId;
};

const getRoleOrThrow = async (authenticatedUserId: number) => {
  const role = await getUserRoleById(authenticatedUserId);
  if (!role) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return role;
};

const assertPostReadable = (
  post: { authorId: number; status: PostStatus },
  role: Role,
  authenticatedUserId: number
) => {
  if (role === Role.ADMIN) return;

  const isOwner = post.authorId === authenticatedUserId;
  const isArchived = post.status === PostStatus.ARCHIVED;
  if (!isOwner || isArchived) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }
};

const assertPostMutable = (
  post: { authorId: number; status: PostStatus },
  role: Role,
  authenticatedUserId: number,
  message: string
) => {
  if (role === Role.ADMIN) return;

  const isOwner = post.authorId === authenticatedUserId;
  const isArchived = post.status === PostStatus.ARCHIVED;
  if (!isOwner || isArchived) {
    throw createError({
      message,
      status: 403,
      code: errorCode.notAllowed,
    });
  }
};
