import { Status } from "@prisma/client";

export type ListProductsParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  status?: Status | undefined;
  materialSlug?: string | undefined;
  typeSlug?: string | undefined;
};

export type CreateProductParams = {
  name: string;
  description: string;
  price: number | string;
  discount?: number | string;
  inventory?: number | string;
  status?: Status;
  materialId: number | string;
  typeId: number | string;
  imageFilenames?: string[];
};

export type UpdateProductParams = {
  name: string;
  description: string;
  price: number | string;
  discount?: number | string;
  inventory?: number | string;
  status?: Status;
  materialId: number | string;
  typeId: number | string;
  imageFilenames?: string[];
  imageIds?: string | number[] | string[];
};

export type ParseProductQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  status?: Status | undefined;
  materialSlug?: string | undefined;
  typeSlug?: string | undefined;
};
