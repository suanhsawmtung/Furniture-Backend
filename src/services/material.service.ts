import { Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../lib/prisma";
import {
  CreateMaterialParams,
  ListMaterialsParams,
  ParseMaterialQueryParamsResult,
  UpdateMaterialParams,
} from "../types/material";
import { createError, createSlug, ensureUniqueSlug } from "../utils/common";

export const getAllMaterials = async ({
  pageSize,
  offset,
  search,
}: ListMaterialsParams) => {
  const where: Prisma.MaterialWhereInput = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  // Get total count for pagination
  const total = await prisma.material.count({ where });

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Calculate current page (0-based offset to 1-based page)
  const currentPage = Math.floor(offset / pageSize) + 1;

  // Fetch materials with offset pagination
  const items = await prisma.material.findMany({
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

export const getMaterialByName = async (name: string) => {
  return await prisma.material.findFirst({
    where: { name },
  });
};

export const getMaterialByNameExcludingId = async (
  name: string,
  excludeId: number
) => {
  return await prisma.material.findFirst({
    where: {
      name,
      NOT: { id: excludeId },
    },
  });
};

export const getMaterialBySlug = async (slug: string) => {
  return await prisma.material.findUnique({
    where: { slug },
  });
};

export const getMaterialById = async (id: number) => {
  return await prisma.material.findUnique({
    where: { id },
  });
};

export const createMaterial = async (
  createMaterialData: Prisma.MaterialCreateInput
) => {
  return await prisma.material.create({
    data: createMaterialData,
  });
};

export const updateMaterial = async (
  id: number,
  updateMaterialData: Prisma.MaterialUpdateInput
) => {
  return await prisma.material.update({
    where: { id },
    data: updateMaterialData,
  });
};

export const deleteMaterial = async (id: number) => {
  return await prisma.material.delete({
    where: { id },
  });
};

// Validation and checking functions that call simple service functions

export const validateAndGetMaterialBySlug = async (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const material = await getMaterialBySlug(slug);

  if (!material) {
    throw createError({
      message: "Material not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return material;
};

export const validateAndCreateMaterial = async (
  params: CreateMaterialParams
) => {
  const { name } = params;
  const trimmedName = name.trim();

  const existingByName = await getMaterialByName(trimmedName);

  if (existingByName) {
    throw createError({
      message: "Material with this name already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const baseSlug = createSlug(trimmedName);
  const slugOwner = await getMaterialBySlug(baseSlug);
  const slugExists = !!slugOwner;
  const slug = await ensureUniqueSlug(baseSlug, slugExists);

  const material = await createMaterial({
    name: trimmedName,
    slug,
  });

  return material;
};

export const validateAndUpdateMaterial = async (
  slug: string,
  params: UpdateMaterialParams
) => {
  const { name } = params;

  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await getMaterialBySlug(slug);
  if (!existing) {
    throw createError({
      message: "Material not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const trimmedName = name.trim();

  const existingByName = await getMaterialByNameExcludingId(
    trimmedName,
    existing.id
  );

  if (existingByName) {
    throw createError({
      message: "Material with this name already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const baseSlug = createSlug(trimmedName);
  const slugOwner = await getMaterialBySlug(baseSlug);
  const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
  const slugValue = await ensureUniqueSlug(baseSlug, slugExists);

  const material = await updateMaterial(existing.id, {
    name: trimmedName,
    slug: slugValue,
  });

  return material;
};

export const validateAndDeleteMaterial = async (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await getMaterialBySlug(slug);
  if (!existing) {
    throw createError({
      message: "Material not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  await deleteMaterial(existing.id);
};

export const parseMaterialQueryParams = (
  query: any
): ParseMaterialQueryParamsResult => {
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
