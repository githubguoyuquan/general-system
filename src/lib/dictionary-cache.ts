import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getTreeByRootKey } from "@/services/dictionary.service";
import type { DictionaryNodeDTO } from "@/types/dictionary";

/** Next.js Data Cache 标签，变更字典后 `revalidateTag(dictionaryCacheTag(rootKey))` */
export const dictionaryCacheTag = (rootKey: string) => `dictionary:${rootKey}` as const;

/**
 * 预留：Redis 等外部缓存（多实例共享）。未注册时仅走 DB + unstable_cache。
 */
export type DictionaryExternalCacheProvider = {
  get: <T>(key: string) => Promise<T | null | undefined>;
  set: <T>(key: string, value: T, ttlSec?: number) => Promise<void>;
  del: (key: string) => Promise<void>;
};

let externalCache: DictionaryExternalCacheProvider | null = null;

export function registerDictionaryExternalCache(provider: DictionaryExternalCacheProvider | null) {
  externalCache = provider;
}

export function getDictionaryExternalCache() {
  return externalCache;
}

async function fetchTree(rootKey: string): Promise<DictionaryNodeDTO | null> {
  const ext = externalCache;
  const redisKey = `dict:tree:${rootKey}`;
  if (ext) {
    const hit = await ext.get<DictionaryNodeDTO | null>(redisKey);
    if (hit !== undefined && hit !== null) return hit;
  }
  const tree = await getTreeByRootKey(rootKey);
  if (ext) {
    if (tree) await ext.set(redisKey, tree, 300);
  }
  return tree;
}

/** 跨请求缓存（默认 300s）+ 按 rootKey 分 tag 失效 */
export async function getCachedDictionaryTree(rootKey: string): Promise<DictionaryNodeDTO | null> {
  return unstable_cache(
    async () => fetchTree(rootKey),
    ["dictionary-tree-v1", rootKey],
    { tags: [dictionaryCacheTag(rootKey)], revalidate: 300 }
  )();
}

/** Server Components：同请求内多次调用会去重 */
export const getDict = cache(async (rootKey: string) => getCachedDictionaryTree(rootKey));
