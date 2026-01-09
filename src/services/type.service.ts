import { Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../lib/prisma";
import {
  CreateTypeParams,
  ListTypesParams,
  ParseTypeQueryParamsResult,
  UpdateTypeParams,
} from "../types/type";
import { createError, createSlug, ensureUniqueSlug } from "../utils/common";

export const getAllTypes = async ({
  pageSize,
  offset,
  search,
}: ListTypesParams) => {
  const where: Prisma.TypeWhereInput = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  // Get total count for pagination
  const total = await prisma.type.count({ where });

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Calculate current page (0-based offset to 1-based page)
  const currentPage = Math.floor(offset / pageSize) + 1;

  // Fetch types with offset pagination
  const items = await prisma.type.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: {
          products: true,
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

export const getTypeByName = async (name: string) => {
  return await prisma.type.findFirst({
    where: { name },
  });
};

export const getTypeByNameExcludingId = async (
  name: string,
  excludeId: number
) => {
  return await prisma.type.findFirst({
    where: {
      name,
      NOT: { id: excludeId },
    },
  });
};

export const getTypeBySlug = async (slug: string) => {
  return await prisma.type.findUnique({
    where: { slug },
  });
};

export const getTypeById = async (id: number) => {
  return await prisma.type.findUnique({
    where: { id },
  });
};

export const createType = async (createTypeData: Prisma.TypeCreateInput) => {
  return await prisma.type.create({
    data: createTypeData,
  });
};

export const updateType = async (
  id: number,
  updateTypeData: Prisma.TypeUpdateInput
) => {
  return await prisma.type.update({
    where: { id },
    data: updateTypeData,
  });
};

export const deleteType = async (id: number) => {
  return await prisma.type.delete({
    where: { id },
  });
};

// Validation and checking functions that call simple service functions

export const validateAndGetTypeBySlug = async (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const type = await getTypeBySlug(slug);

  if (!type) {
    throw createError({
      message: "Type not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return type;
};

export const validateAndCreateType = async (params: CreateTypeParams) => {
  const { name } = params;
  const trimmedName = name.trim();

  const existingByName = await getTypeByName(trimmedName);

  if (existingByName) {
    throw createError({
      message: "Type with this name already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const baseSlug = createSlug(trimmedName);
  const slugOwner = await getTypeBySlug(baseSlug);
  const slugExists = !!slugOwner;
  const slug = await ensureUniqueSlug(baseSlug, slugExists);

  const type = await createType({
    name: trimmedName,
    slug,
  });

  return type;
};

export const validateAndUpdateType = async (
  slug: string,
  params: UpdateTypeParams
) => {
  const { name } = params;

  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await getTypeBySlug(slug);
  if (!existing) {
    throw createError({
      message: "Type not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const trimmedName = name.trim();

  const existingByName = await getTypeByNameExcludingId(
    trimmedName,
    existing.id
  );

  if (existingByName) {
    throw createError({
      message: "Type with this name already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const baseSlug = createSlug(trimmedName);
  const slugOwner = await getTypeBySlug(baseSlug);
  const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
  const slugValue = await ensureUniqueSlug(baseSlug, slugExists);

  const type = await updateType(existing.id, {
    name: trimmedName,
    slug: slugValue,
  });

  return type;
};

export const validateAndDeleteType = async (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await getTypeBySlug(slug);
  if (!existing) {
    throw createError({
      message: "Type not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  await deleteType(existing.id);
};

export const parseTypeQueryParams = (
  query: any
): ParseTypeQueryParamsResult => {
  const pageSizeParam = Number(query.pageSize);
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
