export interface ResponseData<T = unknown> {
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}