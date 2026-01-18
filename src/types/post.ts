import { PostStatus } from "@prisma/client";

export type ListPostsParams = {
  pageSize: number;
  offset: number;
  authenticatedUserId?: number;
  search?: string | undefined;
  categorySlug?: string | undefined;
  status?: PostStatus | undefined;
};

export type CreatePostParams = {
  title: string;
  excerpt: string;
  content: string;
  status?: PostStatus;
  categoryId: number | string;
  imageFilename?: string;
  authenticatedUserId?: number;
};

export type UpdatePostParams = {
  title: string;
  excerpt: string;
  content: string;
  status?: PostStatus;
  categoryId: number | string;
  imageFilename?: string;
  authenticatedUserId?: number;
};

export type ParsePostQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  categorySlug?: string | undefined;
  status?: PostStatus | undefined;
};
