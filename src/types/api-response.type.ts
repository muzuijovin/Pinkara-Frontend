// bentuk response standar dari backend: { success, message, data }
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// endpoint list yang pakai pagination: { ..., data: [...], meta: { page, totalPage, limit, total... } }
export type PaginationMeta = {
  page: number;
  totalPage: number;
  limit: number;
};

export type ApiListResponse<T, TMeta = PaginationMeta> = ApiResponse<T[]> & { meta: TMeta };
