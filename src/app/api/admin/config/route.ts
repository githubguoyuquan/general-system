import { auth } from "@/lib/auth";
import { hitRateLimit } from "@/lib/rate-limit";
import { ok, fail } from "@/lib/api-response";
import { API_CODE } from "@/types/api";
import { withApiHandler } from "@/lib/api-handler";
import { logger } from "@/lib/logger";
import { listConfigs, upsertConfig } from "@/services/system-config.service";
import { z } from "zod";

function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export const GET = withApiHandler(
  async ({ request }) => {
    if (hitRateLimit(`cfg:get:${clientIp(request)}`, 120, 60_000)) {
      return fail(API_CODE.RATE_LIMIT, "请求过于频繁");
    }
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return fail(API_CODE.UNAUTHORIZED, "未登录或非管理员");
    }
    const rows = await listConfigs();
    return ok(rows);
  },
  { label: "GET /api/admin/config" }
);

const patchSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  description: z.string().optional(),
});

export const PATCH = withApiHandler(
  async ({ request }) => {
    if (hitRateLimit(`cfg:patch:${clientIp(request)}`, 60, 60_000)) {
      return fail(API_CODE.RATE_LIMIT, "请求过于频繁");
    }
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return fail(API_CODE.UNAUTHORIZED, "未登录或非管理员");
    }
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return fail(API_CODE.BAD_REQUEST, "JSON 无效");
    }
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return fail(API_CODE.BAD_REQUEST, parsed.error.issues[0]?.message ?? "参数错误");
    }
    const row = await upsertConfig(parsed.data.key, parsed.data.value, parsed.data.description);
    logger.info({ key: row.key, by: session.user.email }, "system config updated");
    return ok(row);
  },
  { label: "PATCH /api/admin/config" }
);
