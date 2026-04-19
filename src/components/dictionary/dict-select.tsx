"use client";

import { useEffect, useState } from "react";
import type { ApiResponse } from "@/types/api";
import type { DictionaryFlatDTO } from "@/types/dictionary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DictSelectProps = {
  /** 字典根节点 key（如 PAYMENT_METHOD） */
  dictKey: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** option 的 value 用节点 id 还是 key，默认 id（稳定） */
  valueMode?: "id" | "key";
};

/**
 * 根据字典根 key 自动拉取直接子项作为下拉选项（仅 isActive）。
 */
export function DictSelect({
  dictKey,
  value,
  onValueChange,
  placeholder = "请选择",
  disabled,
  className,
  valueMode = "id",
}: DictSelectProps) {
  const [options, setOptions] = useState<DictionaryFlatDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/dictionaries/options/${encodeURIComponent(dictKey)}`)
      .then((r) => r.json() as Promise<ApiResponse<DictionaryFlatDTO[]>>)
      .then((j) => {
        if (cancelled) return;
        if (j.code === 0 && Array.isArray(j.data)) setOptions(j.data);
        else setOptions([]);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dictKey]);

  const optVal = (o: DictionaryFlatDTO) => (valueMode === "key" ? o.key : o.id);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || loading}>
      <SelectTrigger className={cn("transition-all duration-300", className)}>
        <SelectValue placeholder={loading ? "加载中…" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={optVal(o)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
