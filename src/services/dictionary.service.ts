import { Prisma, type DictionaryValueType } from "@prisma/client";
import { assertPrismaClientReady, prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { buildTreeForSubtree } from "@/lib/dictionary-tree";
import type { DictionaryCreateInput, DictionaryFlatDTO, DictionaryNodeDTO, UpdateDictionaryInput } from "@/types/dictionary";

export type { DictionaryCreateInput, UpdateDictionaryInput } from "@/types/dictionary";

function dict() {
  assertPrismaClientReady();
  return prisma.dictionary!;
}

function toDTO(r: {
  id: string;
  key: string;
  label: string;
  description: string | null;
  parentId: string | null;
  type: DictionaryValueType;
  valueString: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: Prisma.JsonValue | null;
  sortOrder: number;
  isActive: boolean;
}): DictionaryFlatDTO {
  return {
    id: r.id,
    key: r.key,
    label: r.label,
    description: r.description,
    parentId: r.parentId,
    type: r.type,
    valueString: r.valueString,
    valueNumber: r.valueNumber,
    valueBoolean: r.valueBoolean,
    valueJson: r.valueJson,
    sortOrder: r.sortOrder,
    isActive: r.isActive,
  };
}

/** 从内存列表收集某节点下全部后代 id（按 parentId 建邻接表后 BFS） */
function collectDescendantIds(flat: { id: string; parentId: string | null }[], rootId: string): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const f of flat) {
    if (!f.parentId) continue;
    if (!childrenOf.has(f.parentId)) childrenOf.set(f.parentId, []);
    childrenOf.get(f.parentId)!.push(f.id);
  }
  const ids = new Set<string>([rootId]);
  let frontier = [rootId];
  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const cid of childrenOf.get(id) ?? []) {
        if (!ids.has(cid)) {
          ids.add(cid);
          next.push(cid);
        }
      }
    }
    frontier = next;
  }
  return ids;
}

/** 根据根节点 key 拉取整棵子树（含根），树形结构 */
export async function getTreeByRootKey(rootKey: string): Promise<DictionaryNodeDTO | null> {
  const root = await dict().findUnique({ where: { key: rootKey } });
  if (!root) return null;
  const flatAll = await dict().findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
  const dtoFlat = flatAll.map(toDTO);
  const allowed = collectDescendantIds(
    dtoFlat.map((r) => ({ id: r.id, parentId: r.parentId })),
    root.id
  );
  const sub = dtoFlat.filter((r) => allowed.has(r.id));
  return buildTreeForSubtree(sub, root.id);
}

/** 平铺：某 key 根下所有节点（含根），按 sortOrder */
export async function getFlatUnderRootKey(rootKey: string): Promise<DictionaryFlatDTO[]> {
  const root = await dict().findUnique({ where: { key: rootKey } });
  if (!root) return [];
  const flatAll = await dict().findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
  const dtoFlat = flatAll.map(toDTO);
  const allowed = collectDescendantIds(
    dtoFlat.map((r) => ({ id: r.id, parentId: r.parentId })),
    root.id
  );
  return dtoFlat.filter((r) => allowed.has(r.id));
}

/** 管理端：全部条目 */
export async function listAll(): Promise<DictionaryFlatDTO[]> {
  const rows = await dict().findMany({
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
  });
  return rows.map(toDTO);
}

/** 仅启用项（供 DictSelect / 公开 API） */
export async function listActiveUnderRootKey(rootKey: string): Promise<DictionaryFlatDTO[]> {
  const flat = await getFlatUnderRootKey(rootKey);
  return flat.filter((r) => r.isActive);
}

export async function createEntry(input: DictionaryCreateInput): Promise<DictionaryFlatDTO> {
  const row = await dict().create({
    data: {
      key: input.key,
      label: input.label,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
      type: input.type,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      valueString:
        input.type === "STRING" || input.type === "COLOR" || input.type === "IMAGE" ? input.valueString : null,
      valueNumber: input.type === "NUMBER" ? input.valueNumber : null,
      valueBoolean: input.type === "BOOLEAN" ? input.valueBoolean : null,
      valueJson: input.type === "JSON" ? input.valueJson : Prisma.JsonNull,
    },
  });
  return toDTO(row);
}

async function wouldCreateCycle(nodeId: string, newParentId: string | null): Promise<boolean> {
  if (newParentId === null) return false;
  if (newParentId === nodeId) return true;
  let cur: string | null = newParentId;
  const seen = new Set<string>();
  for (let i = 0; i < 10_000 && cur; i++) {
    if (cur === nodeId) return true;
    if (seen.has(cur)) {
      logger.warn({ cur }, "dictionary parent chain cycle?");
      return true;
    }
    seen.add(cur);
    const step: { parentId: string | null } | null = await dict().findUnique({
      where: { id: cur },
      select: { parentId: true },
    });
    cur = step?.parentId ?? null;
  }
  return false;
}

export async function updateEntry(input: UpdateDictionaryInput): Promise<DictionaryFlatDTO> {
  const existing = await dict().findUnique({ where: { id: input.id } });
  if (!existing) throw new Error("NOT_FOUND");

  const nextParent = input.parentId !== undefined ? input.parentId : existing.parentId;
  if (nextParent !== existing.parentId && nextParent !== null) {
    const cycle = await wouldCreateCycle(input.id, nextParent);
    if (cycle) throw new Error("CYCLE");
  }

  const nextType = input.type ?? existing.type;
  const data: Prisma.DictionaryUncheckedUpdateInput = {};

  if (input.label !== undefined) data.label = input.label;
  if (input.description !== undefined) data.description = input.description;
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.parentId !== undefined) data.parentId = nextParent;
  if (input.type !== undefined) data.type = input.type;

  const valueTouched =
    input.type !== undefined ||
    input.valueString !== undefined ||
    input.valueNumber !== undefined ||
    input.valueBoolean !== undefined ||
    input.valueJson !== undefined;

  if (valueTouched) {
    data.valueString = null;
    data.valueNumber = null;
    data.valueBoolean = null;
    data.valueJson = Prisma.JsonNull;
    const t = nextType;
    if (t === "STRING" || t === "COLOR" || t === "IMAGE") {
      data.valueString =
        input.valueString !== undefined ? input.valueString : (existing.valueString ?? "");
    } else if (t === "NUMBER") {
      data.valueNumber =
        input.valueNumber !== undefined ? input.valueNumber : (existing.valueNumber ?? 0);
    } else if (t === "BOOLEAN") {
      data.valueBoolean =
        input.valueBoolean !== undefined ? input.valueBoolean : (existing.valueBoolean ?? false);
    } else if (t === "JSON") {
      const v =
        input.valueJson !== undefined ? input.valueJson : (existing.valueJson as Prisma.InputJsonValue | null);
      data.valueJson = v === null || v === undefined ? Prisma.JsonNull : v;
    }
  }

  const updated = await dict().update({
    where: { id: input.id },
    data,
  });
  return toDTO(updated);
}

export async function deleteEntry(id: string): Promise<void> {
  await dict().delete({ where: { id } });
}

export async function batchSetActive(ids: string[], isActive: boolean): Promise<number> {
  const res = await dict().updateMany({
    where: { id: { in: ids } },
    data: { isActive },
  });
  return res.count;
}

/** 某根 key 下直接子节点（仅 isActive）。根不存在时返回空数组；需区分「根不存在」请用 `getDirectChildrenForSelectWithRoot`。 */
export async function getDirectChildrenForSelect(rootKey: string): Promise<DictionaryFlatDTO[]> {
  const { items } = await getDirectChildrenForSelectWithRoot(rootKey);
  return items;
}

/** 与 {@link getDirectChildrenForSelect} 相同数据，但可区分字典根 key 是否存在（公开 API 404 用） */
export async function getDirectChildrenForSelectWithRoot(
  rootKey: string
): Promise<{ rootExists: boolean; items: DictionaryFlatDTO[] }> {
  const root = await dict().findUnique({ where: { key: rootKey } });
  if (!root) return { rootExists: false, items: [] };
  const rows = await dict().findMany({
    where: { parentId: root.id, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
  return { rootExists: true, items: rows.map(toDTO) };
}

/** 从任意节点 id 向上追溯到根 key（用于缓存失效 tag） */
export async function getRootKeyForNodeId(nodeId: string): Promise<string | null> {
  let cur: string | null = nodeId;
  let key: string | null = null;
  for (let i = 0; i < 500 && cur; i++) {
    const step: { parentId: string | null; key: string } | null = await dict().findUnique({
      where: { id: cur },
      select: { parentId: true, key: true },
    });
    if (!step) return null;
    key = step.key;
    if (step.parentId === null) return step.key;
    cur = step.parentId;
  }
  return key;
}
