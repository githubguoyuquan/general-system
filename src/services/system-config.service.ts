import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * 热配置持久化与缓存（冷配置请使用 @/lib/cold-config，勿写入本表）。
 *
 * 配置中心服务端单例缓存：
 * - 读：优先内存 Map，未命中再查库并回填
 * - 写：更新 DB 后 invalidate 对应 key，下一次读取即「即时生效」
 */
const valueCache = new Map<string, string>();
let listCache: { rows: Awaited<ReturnType<typeof loadAllFromDb>>; expires: number } | null = null;
const LIST_TTL_MS = 3_000;

async function loadAllFromDb() {
  return prisma.systemConfig.findMany({ orderBy: { key: "asc" } });
}

export function invalidateConfigCache(key?: string) {
  if (key) valueCache.delete(key);
  else valueCache.clear();
  listCache = null;
}

export async function getConfigRaw(key: string): Promise<string | null> {
  const cached = valueCache.get(key);
  if (cached !== undefined) return cached;
  const row = await prisma.systemConfig.findUnique({ where: { key } });
  const v = row?.value ?? null;
  if (v !== null) valueCache.set(key, v);
  return v;
}

/** 解析为 JSON（布尔/数字/字符串/对象） */
export async function getConfigParsed<T = unknown>(key: string): Promise<T | null> {
  const raw = await getConfigRaw(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    logger.warn({ key, err: e }, "config JSON parse failed");
    return null;
  }
}

export async function listConfigs() {
  const now = Date.now();
  if (listCache && listCache.expires > now) return listCache.rows;
  const rows = await loadAllFromDb();
  listCache = { rows, expires: now + LIST_TTL_MS };
  return rows;
}

export async function upsertConfig(key: string, value: unknown, description?: string) {
  const str = JSON.stringify(value);
  const row = await prisma.systemConfig.upsert({
    where: { key },
    create: { key, value: str, description },
    update: { value: str, ...(description !== undefined ? { description } : {}) },
  });
  invalidateConfigCache(key);
  return row;
}
