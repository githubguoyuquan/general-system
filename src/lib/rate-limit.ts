/**
 * 内存限流（进程内 LRU 思路：按 key 计数 + 窗口重置）
 * 适合单机/开发演示；多实例生产应换 Redis 等共享存储
 */
type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export function hitRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let b = store.get(key);
  if (!b || b.resetAt < now) {
    b = { count: 0, resetAt: now + windowMs };
    store.set(key, b);
  }
  b.count += 1;
  if (b.count > limit) return true;
  if (store.size > 10_000) {
    for (const [k, v] of store) {
      if (v.resetAt < now) store.delete(k);
    }
  }
  return false;
}
