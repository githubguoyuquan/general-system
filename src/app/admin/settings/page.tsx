"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUiStore } from "@/hooks/use-ui-store";
import type { ApiResponse } from "@/types/api";
import { HOT_CONFIG } from "@/lib/config-keys";
import type { AppFeatureFlags } from "@/lib/features";

type Row = { id: string; key: string; value: string; description: string | null };

const defaultFlags: AppFeatureFlags = {
  betaHome: false,
  experimentalApi: false,
  showRegisterNav: true,
};

export default function AdminSettingsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [featureFlags, setFeatureFlags] = useState<AppFeatureFlags>(defaultFlags);
  const settingsMessage = useUiStore((s) => s.settingsMessage);
  const setSettingsMessage = useUiStore((s) => s.setSettingsMessage);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/config", { credentials: "include" });
    const json = (await res.json()) as ApiResponse<Row[]>;
    if (json.code === 0 && Array.isArray(json.data)) {
      setRows(json.data);
      const d: Record<string, string> = {};
      for (const r of json.data) d[r.key] = r.value;
      setDrafts(d);
      const fr = json.data.find((r) => r.key === HOT_CONFIG.APP_FEATURES);
      if (fr?.value) {
        try {
          setFeatureFlags({ ...defaultFlags, ...(JSON.parse(fr.value) as AppFeatureFlags) });
        } catch {
          setFeatureFlags(defaultFlags);
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveRow(key: string) {
    setSettingsMessage(null);
    const raw = drafts[key];
    let parsed: unknown = raw;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
    const res = await fetch("/api/admin/config", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: parsed }),
    });
    const j = (await res.json()) as ApiResponse<Row>;
    if (j.code === 0) {
      setSettingsMessage(`已保存：${key}`);
      await load();
    } else {
      setSettingsMessage(j.message || "保存失败");
    }
  }

  async function saveFeatureFlags() {
    setSettingsMessage(null);
    const res = await fetch("/api/admin/config", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: HOT_CONFIG.APP_FEATURES, value: featureFlags }),
    });
    const j = (await res.json()) as ApiResponse<Row>;
    if (j.code === 0) {
      setSettingsMessage("功能开关已保存（app.features）");
      await load();
    } else {
      setSettingsMessage(j.message || "保存失败");
    }
  }

  function toggleFlag<K extends keyof AppFeatureFlags>(k: K) {
    setFeatureFlags((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">系统配置</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <strong>热配置</strong>存于数据库，经本页修改后经缓存失效后<strong>即时生效</strong>。
          <strong>冷配置</strong>（密钥、DB 连接等）仅来自 .env，改后需<strong>重启进程</strong>（见{" "}
          <code className="rounded bg-muted px-1">src/lib/cold-config.ts</code>）。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>功能开关（Feature Flags）</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            对应热配置键 <code className="rounded bg-muted px-1">{HOT_CONFIG.APP_FEATURES}</code>
            ，JSON 存储；此处提供常用项快捷切换，亦可在下表直接编辑原始 JSON。
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ff-beta"
                className="h-4 w-4"
                checked={Boolean(featureFlags.betaHome)}
                onChange={() => toggleFlag("betaHome")}
              />
              <label htmlFor="ff-beta">betaHome — 实验性首页模块</label>
            </li>
            <li className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ff-api"
                className="h-4 w-4"
                checked={Boolean(featureFlags.experimentalApi)}
                onChange={() => toggleFlag("experimentalApi")}
              />
              <label htmlFor="ff-api">experimentalApi — 新接口灰度</label>
            </li>
            <li className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ff-regnav"
                className="h-4 w-4"
                checked={Boolean(featureFlags.showRegisterNav)}
                onChange={() => toggleFlag("showRegisterNav")}
              />
              <label htmlFor="ff-regnav">showRegisterNav — 导航显示「注册」（仍需 auth.register_open）</label>
            </li>
          </ul>
          <Button type="button" onClick={() => void saveFeatureFlags()}>
            保存功能开关
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>全部热配置（Key-Value）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingsMessage ? <p className="text-sm text-primary">{settingsMessage}</p> : null}
          {loading ? (
            <p className="text-sm text-muted-foreground">加载中…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">键 key</TableHead>
                  <TableHead>说明</TableHead>
                  <TableHead className="min-w-[280px]">值（JSON 或纯文本）</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.key}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{r.description}</TableCell>
                    <TableCell>
                      <Input
                        value={drafts[r.key] ?? ""}
                        onChange={(e) => setDrafts((d) => ({ ...d, [r.key]: e.target.value }))}
                        className="font-mono text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Button type="button" size="sm" variant="outline" onClick={() => void saveRow(r.key)}>
                        保存
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
            刷新列表
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
