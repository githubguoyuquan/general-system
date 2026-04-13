/** 统一 API 响应结构（与前端约定 code === 0 为成功） */
export type ApiResponse<T = unknown> = {
  code: number;
  data: T;
  message: string;
  timestamp: string;
};

export const API_CODE = {
  OK: 0,
  BAD_REQUEST: 40000,
  UNAUTHORIZED: 40100,
  FORBIDDEN: 40300,
  NOT_FOUND: 40400,
  CONFLICT: 40900,
  RATE_LIMIT: 42900,
  SERVER: 50000,
} as const;
