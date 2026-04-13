import { z } from "zod";

/**
 * 冷配置：仅来自 process.env，不涉及数据库。
 * 修改 .env 后必须重启 Next.js 进程才会生效。
 */
const coldSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL 必填"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET 必填"),
  AUTH_TRUST_HOST: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  LOG_LEVEL: z.string().optional(),
});

export type ColdConfig = z.infer<typeof coldSchema>;

let memo: ColdConfig | null = null;

/** 解析并缓存冷配置；开发环境缺失项会在首次访问时报错，便于发现配置问题 */
export function getColdConfig(): ColdConfig {
  if (memo) return memo;
  const parsed = coldSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    throw new Error(`冷配置校验失败: ${msg}`);
  }
  memo = parsed.data;
  return memo;
}

/** 单元测试或热重载场景可清空缓存 */
export function resetColdConfigCache() {
  memo = null;
}
