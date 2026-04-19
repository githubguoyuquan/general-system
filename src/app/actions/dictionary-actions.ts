"use server";

import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { dictionaryCacheTag, getDictionaryExternalCache } from "@/lib/dictionary-cache";
import type { DictionaryCreateInput, UpdateDictionaryInput } from "@/types/dictionary";
import {
  batchSetActive,
  createEntry,
  deleteEntry,
  getRootKeyForNodeId,
  listAll,
  updateEntry,
} from "@/services/dictionary.service";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
}

async function invalidateByRootKeys(keys: string[]) {
  const uniq = [...new Set(keys)];
  for (const k of uniq) {
    revalidateTag(dictionaryCacheTag(k));
    const ext = getDictionaryExternalCache();
    if (ext) await ext.del(`dict:tree:${k}`);
  }
}

export async function actionListDictionaries() {
  await requireAdmin();
  return listAll();
}

export async function actionCreateDictionary(input: DictionaryCreateInput) {
  await requireAdmin();
  const row = await createEntry(input);
  const root = await getRootKeyForNodeId(row.id);
  if (root) await invalidateByRootKeys([root]);
  return row;
}

export async function actionUpdateDictionary(input: UpdateDictionaryInput) {
  await requireAdmin();
  const beforeRoot = await getRootKeyForNodeId(input.id);
  const row = await updateEntry(input);
  const afterRoot = await getRootKeyForNodeId(row.id);
  await invalidateByRootKeys([beforeRoot, afterRoot].filter(Boolean) as string[]);
  return row;
}

export async function actionDeleteDictionary(id: string) {
  await requireAdmin();
  const root = await getRootKeyForNodeId(id);
  await deleteEntry(id);
  if (root) await invalidateByRootKeys([root]);
}

export async function actionBatchSetDictionaryActive(ids: string[], isActive: boolean) {
  await requireAdmin();
  const roots = new Set<string>();
  for (const id of ids) {
    const r = await getRootKeyForNodeId(id);
    if (r) roots.add(r);
  }
  await batchSetActive(ids, isActive);
  await invalidateByRootKeys([...roots]);
}

