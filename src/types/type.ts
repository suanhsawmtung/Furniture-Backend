export type ListTypesParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
};

export type CreateTypeParams = {
  name: string;
};

export type UpdateTypeParams = {
  name: string;
};

export type ParseTypeQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
};
