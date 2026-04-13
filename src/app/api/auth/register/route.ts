import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { HOT_CONFIG } from "@/lib/config-keys";
import { getSysConfigParsed } from "@/lib/sys-config";
import { ok, fail } from "@/lib/api-response";
import { API_CODE } from "@/types/api";
import { withApiHandler } from "@/lib/api-handler";
import { hitRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "密码至少 8 位"),
  name: z.string().max(40).optional(),
});

/**
 * 自助注册：受热配置 auth.register_open 控制；关闭后返回 403。
 */
export const POST = withApiHandler(async ({ request }) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (hitRateLimit(`register:${ip}`, 10, 60_000)) {
    return fail(API_CODE.RATE_LIMIT, "注册请求过于频繁");
  }

  const allowed = (await getSysConfigParsed<boolean>(HOT_CONFIG.AUTH_REGISTER_OPEN)) === true;
  if (!allowed) {
    return fail(API_CODE.FORBIDDEN, "当前未开放注册", null);
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail(API_CODE.BAD_REQUEST, "请求体不是有效的 JSON");
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return fail(API_CODE.BAD_REQUEST, parsed.error.issues[0]?.message ?? "参数错误");
  }

  const { email, password, name } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return fail(API_CODE.CONFLICT, "该邮箱已注册");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      role: "user",
    },
  });

  logger.info({ email }, "user registered");
  return ok({ email }, "注册成功，请登录");
}, { label: "POST /api/auth/register" });
