
export type TQueryParams = Record<string, string | number | boolean | undefined>;

export interface IListParams {

  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  filters?: TQueryParams;
}

