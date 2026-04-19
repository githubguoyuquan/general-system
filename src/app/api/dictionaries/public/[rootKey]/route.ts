import { getCachedDictionaryTree } from "@/lib/dictionary-cache";
import { ok, fail } from "@/lib/api-response";
import { API_CODE } from "@/types/api";

export async function GET(_request: Request, context: { params: Promise<{ rootKey: string }> }) {
  const { rootKey } = await context.params;
  const key = decodeURIComponent(rootKey);
  const tree = await getCachedDictionaryTree(key);
  if (!tree) return fail(API_CODE.NOT_FOUND, "字典不存在或已删除");
  return ok(tree);
}
