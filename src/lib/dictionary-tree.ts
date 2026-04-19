import type { DictionaryFlatDTO, DictionaryNodeDTO } from "@/types/dictionary";

/** 在仅含子树的 flat 上，以 rootId 为根组装嵌套 children */
export function buildTreeForSubtree(flat: DictionaryFlatDTO[], rootId: string): DictionaryNodeDTO | null {
  const map = new Map<string, DictionaryNodeDTO>();
  for (const r of flat) {
    map.set(r.id, { ...r, children: [] });
  }
  const root = map.get(rootId);
  if (!root) return null;
  for (const r of flat) {
    if (r.id === rootId) continue;
    const parent = r.parentId ? map.get(r.parentId) : undefined;
    if (parent) parent.children!.push(map.get(r.id)!);
  }
  for (const n of map.values()) {
    n.children?.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  }
  return root;
}

/** 多根森林：所有 parentId 为 null 的节点各自成树 */
export function buildForestFromFlat(flat: DictionaryFlatDTO[]): DictionaryNodeDTO[] {
  const roots = flat.filter((r) => r.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder || a.key.localeCompare(b.key));
  const trees: DictionaryNodeDTO[] = [];
  for (const r of roots) {
    const t = buildTreeForSubtree(flat, r.id);
    if (t) trees.push(t);
  }
  return trees;
}
