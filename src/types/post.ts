export type ListPostsParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  categorySlug?: string | undefined;
};

export type CreatePostParams = {
  title: string;
  content: string;
  body: string;
  categoryId: number | string;
  imageFilename?: string;
  authenticatedUserId: number;
};

export type UpdatePostParams = {
  title: string;
  content: string;
  body: string;
  categoryId: number | string;
  imageFilename?: string;
};

export type ParsePostQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  categorySlug?: string | undefined;
};
