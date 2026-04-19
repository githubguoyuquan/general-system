"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiResponse } from "@/types/api";
import type { DictionaryNodeDTO } from "@/types/dictionary";

type State = {
  data: DictionaryNodeDTO | null;
  loading: boolean;
  error: string | null;
};

/**
 * 客户端按根 key 拉取整棵字典树（公开 API，仅缓存于组件状态；服务端请用 getDict）。
 */
export function useDictionary(rootKey: string | null | undefined) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  const load = useCallback(async () => {
    if (!rootKey?.trim()) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`/api/dictionaries/public/${encodeURIComponent(rootKey)}`, { credentials: "omit" });
      const json = (await res.json()) as ApiResponse<DictionaryNodeDTO>;
      if (json.code === 0) {
        setState({ data: json.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: json.message || "加载失败" });
      }
    } catch {
      setState({ data: null, loading: false, error: "网络错误" });
    }
  }, [rootKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}
