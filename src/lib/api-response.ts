import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";
import { API_CODE } from "@/types/api";

function body<T>(code: number, data: T, message: string): ApiResponse<T> {
  return { code, data, message, timestamp: new Date().toISOString() };
}

export function ok<T>(data: T, message = "ok") {
  return NextResponse.json(body(API_CODE.OK, data, message));
}

export function fail(code: number, message: string, data: unknown = null) {
  const status =
    code === API_CODE.UNAUTHORIZED
      ? 401
      : code === API_CODE.FORBIDDEN
        ? 403
        : code === API_CODE.NOT_FOUND
          ? 404
          : code === API_CODE.CONFLICT
            ? 409
            : code === API_CODE.RATE_LIMIT
              ? 429
              : code >= 50000
                ? 500
                : 400;
  return NextResponse.json(body(code, data, message), { status });
}
