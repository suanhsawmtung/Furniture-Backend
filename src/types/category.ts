export type ListCategoriesParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
};

export type CreateCategoryParams = {
  name: string;
};

export type UpdateCategoryParams = {
  name: string;
};

export type ParseCategoryQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
};
