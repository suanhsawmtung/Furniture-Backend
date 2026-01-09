import { Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../lib/prisma";
import {
  CreateCategoryParams,
  ListCategoriesParams,
  ParseCategoryQueryParamsResult,
  UpdateCategoryParams,
} from "../types/category";
import { createError, createSlug, ensureUniqueSlug } from "../utils/common";

export const getAllCategories = async ({
  pageSize,
  offset,
  search,
}: ListCategoriesParams) => {
  const where: Prisma.CategoryWhereInput = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  // Get total count for pagination
  const total = await prisma.category.count({ where });

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Calculate current page (0-based offset to 1-based page)
  const currentPage = Math.floor(offset / pageSize) + 1;

  // Fetch categories with offset pagination
  const items = await prisma.category.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return {
    items,
    currentPage,
    totalPages,
    pageSize,
  };
};

export const getAllCategoriesSimple = async () => {
  return await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { id: "asc" },
  });
};

export const getCategoryByName = async (name: string) => {
  return await prisma.category.findFirst({
    where: { name },
  });
};

export const getCategoryByNameExcludingId = async (
  name: string,
  excludeId: number
) => {
  return await prisma.category.findFirst({
    where: {
      name,
      NOT: { id: excludeId },
    },
  });
};

export const getCategoryBySlug = async (slug: string) => {
  return await prisma.category.findUnique({
    where: { slug },
  });
};

export const getCategoryById = async (id: number) => {
  return await prisma.category.findUnique({
    where: { id },
  });
};

export const createCategory = async (
  createCategoryData: Prisma.CategoryCreateInput
) => {
  return await prisma.category.create({
    data: createCategoryData,
  });
};

export const updateCategory = async (
  id: number,
  updateCategoryData: Prisma.CategoryUpdateInput
) => {
  return await prisma.category.update({
    where: { id },
    data: updateCategoryData,
  });
};

export const deleteCategory = async (id: number) => {
  return await prisma.category.delete({
    where: { id },
  });
};

// Validation and checking functions that call simple service functions

export const validateAndGetCategoryBySlug = async (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const category = await getCategoryBySlug(slug);

  if (!category) {
    throw createError({
      message: "Category not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return category;
};

export const validateAndCreateCategory = async (
  params: CreateCategoryParams
) => {
  const { name } = params;
  const trimmedName = name.trim();

  const existingByName = await getCategoryByName(trimmedName);

  if (existingByName) {
    throw createError({
      message: "Category with this name already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const baseSlug = createSlug(trimmedName);
  const slugOwner = await getCategoryBySlug(baseSlug);
  const slugExists = !!slugOwner;
  const slug = await ensureUniqueSlug(baseSlug, slugExists);

  const category = await createCategory({
    name: trimmedName,
    slug,
  });

  return category;
};

export const validateAndUpdateCategory = async (
  slug: string,
  params: UpdateCategoryParams
) => {
  const { name } = params;

  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await getCategoryBySlug(slug);
  if (!existing) {
    throw createError({
      message: "Category not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const trimmedName = name.trim();

  const existingByName = await getCategoryByNameExcludingId(
    trimmedName,
    existing.id
  );

  if (existingByName) {
    throw createError({
      message: "Category with this name already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const baseSlug = createSlug(trimmedName);
  const slugOwner = await getCategoryBySlug(baseSlug);
  const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
  const slugValue = await ensureUniqueSlug(baseSlug, slugExists);

  const category = await updateCategory(existing.id, {
    name: trimmedName,
    slug: slugValue,
  });

  return category;
};

export const validateAndDeleteCategory = async (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await getCategoryBySlug(slug);
  if (!existing) {
    throw createError({
      message: "Category not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  await deleteCategory(existing.id);
};

export const parseCategoryQueryParams = (
  query: any
): ParseCategoryQueryParamsResult => {
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

  return {
    pageSize,
    offset,
    search,
  };
};
