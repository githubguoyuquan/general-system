"use client";

import { useCallback, useEffect, useState } from "react";
import type { MockUser } from "@/lib/mock";
import { deleteMockUser, listMockUsers, saveMockUser, type SaveMockUserInput } from "@/services/mock-user.service";

export function useMockUsers(initialPageSize = 5) {
  const [items, setItems] = useState<MockUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMockUsers({ q, role, status, page, pageSize });
      setItems(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [q, role, status, page, pageSize]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createOrUpdate = useCallback(
    async (input: SaveMockUserInput) => {
      await saveMockUser(input);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteMockUser(id);
      await refresh();
    },
    [refresh]
  );

  return {
    items,
    total,
    page,
    setPage,
    pageSize,
    q,
    setQ,
    role,
    setRole,
    status,
    setStatus,
    loading,
    refresh,
    createOrUpdate,
    remove,
  };
}
