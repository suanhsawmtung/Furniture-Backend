export type ListMaterialsParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
};

export type CreateMaterialParams = {
  name: string;
};

export type UpdateMaterialParams = {
  name: string;
};

export type ParseMaterialQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
};
