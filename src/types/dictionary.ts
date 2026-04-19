import type { DictionaryValueType, Prisma } from "@prisma/client";

/** 创建字典项（与 services 层一致；名称勿用 CreateDictionary* 以免与历史客户端 bundle 混淆） */
type DictionaryCreateValuePayload =
  | { type: "STRING" | "COLOR" | "IMAGE"; valueString: string }
  | { type: "NUMBER"; valueNumber: number }
  | { type: "BOOLEAN"; valueBoolean: boolean }
  | { type: "JSON"; valueJson: Prisma.InputJsonValue };

export type DictionaryCreateInput = {
  key: string;
  label: string;
  description?: string | null;
  parentId?: string | null;
  type: DictionaryValueType;
  sortOrder?: number;
  isActive?: boolean;
} & DictionaryCreateValuePayload;

export type UpdateDictionaryInput = {
  id: string;
  label?: string;
  description?: string | null;
  parentId?: string | null;
  type?: DictionaryValueType;
  sortOrder?: number;
  isActive?: boolean;
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueJson?: Prisma.InputJsonValue | null;
};

/** 与 Prisma `Dictionary` 行对应的传输对象（树形可嵌套 children） */
export type DictionaryNodeDTO = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  parentId: string | null;
  type: DictionaryValueType;
  valueString: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
  sortOrder: number;
  isActive: boolean;
  children?: DictionaryNodeDTO[];
};

/** 平铺列表（管理端表格） */
export type DictionaryFlatDTO = Omit<DictionaryNodeDTO, "children">;

/** 根据 type 推断的「当前值」联合类型（便于表单与 DictSelect） */
export type DictionaryValue =
  | { type: "STRING" | "COLOR" | "IMAGE"; value: string }
  | { type: "NUMBER"; value: number }
  | { type: "BOOLEAN"; value: boolean }
  | { type: "JSON"; value: unknown };

export function rowToValue(row: Pick<DictionaryFlatDTO, "type" | "valueString" | "valueNumber" | "valueBoolean" | "valueJson">): DictionaryValue {
  switch (row.type) {
    case "STRING":
    case "COLOR":
    case "IMAGE":
      return { type: row.type, value: row.valueString ?? "" };
    case "NUMBER":
      return { type: "NUMBER", value: row.valueNumber ?? 0 };
    case "BOOLEAN":
      return { type: "BOOLEAN", value: row.valueBoolean ?? false };
    case "JSON":
      return { type: "JSON", value: row.valueJson ?? null };
  }
}
