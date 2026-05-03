import { Prisma, type DictionaryValueType, type PrismaClient } from "@prisma/client";

/**
 * 单次 PostgreSQL 递归 CTE 拉取某节点下整棵子树全行（含根），按 sortOrder、label 排序。
 * 替代「子树 id + findMany({ id: { in } })」，避免大子树时 IN 列表过长与二次往返。
 */
export async function queryDictionarySubtreeRows(
  prisma: PrismaClient,
  rootId: string
): Promise<
  Array<{
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
  }>
> {
  return prisma.$queryRaw(
    Prisma.sql`
      WITH RECURSIVE subtree AS (
        SELECT *
        FROM "dictionaries"
        WHERE "id" = ${rootId}
        UNION ALL
        SELECT d.*
        FROM "dictionaries" d
        INNER JOIN subtree s ON d."parentId" = s."id"
      )
      SELECT
        "id",
        "key",
        "label",
        "description",
        "parentId",
        "type"::text AS "type",
        "valueString",
        "valueNumber",
        "valueBoolean",
        "valueJson",
        "sortOrder",
        "isActive"
      FROM subtree
      ORDER BY "sortOrder" ASC, "label" ASC
    `
  );
}
