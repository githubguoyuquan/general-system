import { getDirectChildrenForSelectWithRoot } from "@/services/dictionary.service";
import { ok, fail } from "@/lib/api-response";
import { API_CODE } from "@/types/api";

/** 供 DictSelect：某字典根 key 下直接子节点（已启用） */
export async function GET(_request: Request, context: { params: Promise<{ rootKey: string }> }) {
  const { rootKey } = await context.params;
  const key = decodeURIComponent(rootKey);
  const { rootExists, items } = await getDirectChildrenForSelectWithRoot(key);
  if (!rootExists) return fail(API_CODE.NOT_FOUND, "字典不存在");
  return ok(items);
}
