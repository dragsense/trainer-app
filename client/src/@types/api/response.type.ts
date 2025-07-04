

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };
