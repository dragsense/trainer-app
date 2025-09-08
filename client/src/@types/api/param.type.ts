
export type TQueryParams = Record<string, unknown>;

export interface IListParams {

  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  filters?: TQueryParams;
}
