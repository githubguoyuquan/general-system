/**
 * 热配置统一入口：先走内存缓存，未命中再查 PostgreSQL（由 system-config.service 实现）。
 * 仅用于「热配置」键；密钥与连接串请使用 getColdConfig()。
 */
import {
  getConfigParsed,
  getConfigRaw,
  invalidateConfigCache,
  upsertConfig,
} from "@/services/system-config.service";

/**
 * 读取热配置原始 JSON 字符串（缓存 → DB）
 */
export async function getSysConfig(key: string): Promise<string | null> {
  return getConfigRaw(key);
}

/**
 * 读取热配置并 JSON.parse（缓存 → DB）
 */
export async function getSysConfigParsed<T = unknown>(key: string): Promise<T | null> {
  return getConfigParsed<T>(key);
}

export { invalidateConfigCache, upsertConfig };
