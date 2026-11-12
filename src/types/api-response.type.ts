// bentuk response standar dari backend: { success, message, data }
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
