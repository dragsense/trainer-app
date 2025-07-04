import { Id } from "../general.type";

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface IListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  filters?: QueryParams;

}

export type ListParamsWithId = Id & IListParams;
