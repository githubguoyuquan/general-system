import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { fail } from "@/lib/api-response";
import { API_CODE } from "@/types/api";

type Ctx = { request: Request; params?: Record<string, string> };

/**
 * 包装 Route Handler：统一 try/catch，返回标准 JSON 错误体（避免空 500）
 */
export function withApiHandler(
  handler: (ctx: Ctx) => Promise<NextResponse>,
  opts?: { label?: string }
) {
  return async (
    request: Request,
    context: { params: Promise<Record<string, string | string[] | undefined>> }
  ) => {
    const label = opts?.label ?? "api";
    try {
      const raw = await context.params;
      const params: Record<string, string> | undefined =
        raw && Object.keys(raw).length > 0
          ? Object.fromEntries(
              Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? (v[0] ?? "") : (v ?? "")])
            )
          : undefined;
      return await handler({ request, params });
    } catch (e) {
      logger.error({ err: e, label }, "unhandled api error");
      const msg = process.env.NODE_ENV === "development" && e instanceof Error ? e.message : "服务器内部错误";
      return fail(API_CODE.SERVER, msg);
    }
  };
}
