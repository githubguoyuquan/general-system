import { ok, fail } from "@/lib/api-response";
import { withApiHandler } from "@/lib/api-handler";
import { hitRateLimit } from "@/lib/rate-limit";
import { API_CODE } from "@/types/api";

export const GET = withApiHandler(async ({ request }) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (hitRateLimit(`health:${ip}`, 200, 60_000)) {
    return fail(API_CODE.RATE_LIMIT, "请求过于频繁");
  }
  return ok({ status: "ok" });
}, { label: "GET /api/health" });
