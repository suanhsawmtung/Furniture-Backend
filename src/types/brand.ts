export type ListBrandsParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
};

export type CreateBrandParams = {
  name: string;
};

export type UpdateBrandParams = {
  name: string;
};

export type ParseBrandQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
};
