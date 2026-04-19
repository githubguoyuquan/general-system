"use client";

import * as React from "react";
import type { DictionaryValueType } from "@prisma/client";
import { ChevronRight, FileText, FolderTree, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  actionBatchSetDictionaryActive,
  actionCreateDictionary,
  actionDeleteDictionary,
  actionListDictionaries,
  actionUpdateDictionary,
} from "@/app/actions/dictionary-actions";
import { buildForestFromFlat } from "@/lib/dictionary-tree";
import type { DictionaryFlatDTO, DictionaryNodeDTO } from "@/types/dictionary";
import { cn } from "@/lib/utils";

const VALUE_TYPES: DictionaryValueType[] = ["STRING", "NUMBER", "BOOLEAN", "JSON", "COLOR", "IMAGE"];

function collectDescendantIds(flat: DictionaryFlatDTO[], nodeId: string): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const f of flat) {
    if (!f.parentId) continue;
    if (!childrenOf.has(f.parentId)) childrenOf.set(f.parentId, []);
    childrenOf.get(f.parentId)!.push(f.id);
  }
  const ids = new Set<string>([nodeId]);
  let frontier = [nodeId];
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

function TreeItem({
  node,
  depth,
  selectedId,
  expanded,
  onSelect,
  onToggle,
}: {
  node: DictionaryNodeDTO;
  depth: number;
  selectedId: string | null;
  expanded: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isOpen = expanded.has(node.id);
  const Icon = hasChildren || depth === 0 ? FolderTree : FileText;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors duration-300",
          selectedId === node.id ? "bg-primary/15 text-primary ring-1 ring-primary/20" : "hover:bg-muted/60"
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <button
          type="button"
          className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded", !hasChildren && "invisible")}
          onClick={() => onToggle(node.id)}
          aria-label={isOpen ? "折叠" : "展开"}
        >
          <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-90")} />
        </button>
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => onSelect(node.id)}>
          <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <span className="truncate font-medium">{node.label}</span>
          <span className="truncate font-mono text-[10px] text-muted-foreground">{node.key}</span>
        </button>
      </div>
      {hasChildren && isOpen ? (
        <div>
          {node.children!.map((ch) => (
            <TreeItem
              key={ch.id}
              node={ch}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type FormState = {
  key: string;
  label: string;
  description: string;
  parentId: string;
  type: DictionaryValueType;
  valueString: string;
  valueNumber: string;
  valueBoolean: boolean;
  valueJson: string;
  sortOrder: string;
  isActive: boolean;
};

function emptyForm(parentId: string | null): FormState {
  return {
    key: "",
    label: "",
    description: "",
    parentId: parentId ?? "",
    type: "STRING",
    valueString: "",
    valueNumber: "0",
    valueBoolean: false,
    valueJson: "{}",
    sortOrder: "0",
    isActive: true,
  };
}

function rowToForm(row: DictionaryFlatDTO): FormState {
  let jsonStr = "{}";
  if (row.valueJson !== null && row.valueJson !== undefined) {
    try {
      jsonStr = JSON.stringify(row.valueJson, null, 2);
    } catch {
      jsonStr = String(row.valueJson);
    }
  }
  return {
    key: row.key,
    label: row.label,
    description: row.description ?? "",
    parentId: row.parentId ?? "",
    type: row.type,
    valueString: row.valueString ?? "",
    valueNumber: row.valueNumber != null ? String(row.valueNumber) : "0",
    valueBoolean: row.valueBoolean ?? false,
    valueJson: jsonStr,
    sortOrder: String(row.sortOrder),
    isActive: row.isActive,
  };
}

export function DictionaryAdminClient({ initial }: { initial: DictionaryFlatDTO[] }) {
  const [flat, setFlat] = React.useState(initial);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(initial.filter((r) => !r.parentId).map((r) => r.id)));
  const [form, setForm] = React.useState<FormState>(emptyForm(null));
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<DictionaryValueType | "all">("all");
  const [saving, setSaving] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDefaults, setCreateDefaults] = React.useState<{ parentId: string | null }>({ parentId: null });
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const forest = React.useMemo(() => buildForestFromFlat(flat), [flat]);

  const selectedRow = React.useMemo(() => flat.find((r) => r.id === selectedId) ?? null, [flat, selectedId]);

  React.useEffect(() => {
    if (selectedRow) setForm(rowToForm(selectedRow));
  }, [selectedRow]);

  const parentOptions = React.useMemo(() => {
    if (!selectedId) return flat;
    const ban = collectDescendantIds(flat, selectedId);
    return flat.filter((r) => r.id !== selectedId && !ban.has(r.id));
  }, [flat, selectedId]);

  async function refresh() {
    const rows = await actionListDictionaries();
    setFlat(rows);
  }

  function onSelect(id: string) {
    setSelectedId(id);
    const row = flat.find((r) => r.id === id);
    if (row) setForm(rowToForm(row));
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const filteredTable = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return flat.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (!q) return true;
      return (
        r.key.toLowerCase().includes(q) ||
        r.label.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [flat, search, typeFilter]);

  async function handleSave() {
    if (!selectedRow) return;
    setSaving(true);
    try {
      let valueJson: unknown = null;
      if (form.type === "JSON") {
        try {
          valueJson = JSON.parse(form.valueJson || "null");
        } catch {
          toast.error("JSON 格式无效");
          setSaving(false);
          return;
        }
      }
      const sortOrder = Number.parseInt(form.sortOrder, 10);
      await actionUpdateDictionary({
        id: selectedRow.id,
        label: form.label,
        description: form.description || null,
        parentId: form.parentId ? form.parentId : null,
        type: form.type,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isActive: form.isActive,
        valueString: form.type === "STRING" || form.type === "COLOR" || form.type === "IMAGE" ? form.valueString : undefined,
        valueNumber: form.type === "NUMBER" ? Number.parseFloat(form.valueNumber) : undefined,
        valueBoolean: form.type === "BOOLEAN" ? form.valueBoolean : undefined,
        valueJson: form.type === "JSON" ? (valueJson as object) : undefined,
      });
      toast.success("已保存");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedRow) return;
    if (!confirm(`确定删除「${selectedRow.label}」及其子节点？`)) return;
    setSaving(true);
    try {
      await actionDeleteDictionary(selectedRow.id);
      toast.success("已删除");
      setSelectedId(null);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    setSaving(true);
    try {
      const sortOrder = Number.parseInt(form.sortOrder, 10);
      const parentId = createDefaults.parentId;
      const common = {
        key: form.key.trim(),
        label: form.label.trim(),
        description: form.description || null,
        parentId,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isActive: form.isActive,
      };
      if (!common.key || !common.label) {
        toast.error("请填写 key 与 label");
        setSaving(false);
        return;
      }
      const type = form.type;
      if (type === "STRING" || type === "COLOR" || type === "IMAGE") {
        await actionCreateDictionary({ ...common, type, valueString: form.valueString });
      } else if (type === "NUMBER") {
        await actionCreateDictionary({ ...common, type, valueNumber: Number.parseFloat(form.valueNumber) || 0 });
      } else if (type === "BOOLEAN") {
        await actionCreateDictionary({ ...common, type, valueBoolean: form.valueBoolean });
      } else {
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(form.valueJson || "null");
        } catch {
          toast.error("JSON 格式无效");
          setSaving(false);
          return;
        }
        await actionCreateDictionary({ ...common, type: "JSON", valueJson: parsedJson as object });
      }
      toast.success("已创建");
      setCreateOpen(false);
      setForm(emptyForm(null));
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "创建失败");
    } finally {
      setSaving(false);
    }
  }

  async function batchActive(isActive: boolean) {
    if (selectedIds.size === 0) return;
    setSaving(true);
    try {
      await actionBatchSetDictionaryActive([...selectedIds], isActive);
      toast.success("批量状态已更新");
      setSelectedIds(new Set());
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败");
    } finally {
      setSaving(false);
    }
  }

  function openCreate(parentId: string | null) {
    setCreateDefaults({ parentId });
    setForm(emptyForm(parentId));
    setCreateOpen(true);
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-1">
      <PageHeader
        title="数据字典"
        description="与系统配置（SystemConfig）分表存储；支持树形层级、强类型取值与缓存。"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(240px,280px)_1fr]">
        <Card className="shadow-card-md transition-shadow duration-300 hover:shadow-card-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">字典树</CardTitle>
            <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => openCreate(null)}>
              <Plus className="h-3.5 w-3.5" />
              根节点
            </Button>
          </CardHeader>
          <CardContent className="max-h-[480px] overflow-auto pr-1">
            {forest.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无数据，请创建根节点。</p>
            ) : (
              forest.map((n) => (
                <TreeItem
                  key={n.id}
                  node={n}
                  depth={0}
                  selectedId={selectedId}
                  expanded={expanded}
                  onSelect={onSelect}
                  onToggle={toggleExpand}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card-md transition-shadow duration-300 hover:shadow-card-md">
          <CardHeader>
            <CardTitle className="text-base">编辑项</CardTitle>
            <CardDescription>按类型显示控件；修改父级时已做环检测。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedRow ? (
              <p className="text-sm text-muted-foreground">在左侧选择节点，或新建根/子节点。</p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>key（唯一）</Label>
                    <Input value={form.key} disabled className="font-mono text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>label</Label>
                    <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>说明</Label>
                    <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>父节点</Label>
                    <Select value={form.parentId || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, parentId: v === "__none__" ? "" : v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="无（根）" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        <SelectItem value="__none__">（无）顶级</SelectItem>
                        {parentOptions.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.label} · {r.key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>类型</Label>
                    <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as DictionaryValueType }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VALUE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>排序</Label>
                    <Input value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Switch checked={form.isActive} onCheckedChange={(c) => setForm((f) => ({ ...f, isActive: c }))} id="active" />
                    <Label htmlFor="active">启用</Label>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/20 p-4 shadow-sm">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">取值</p>
                  {form.type === "STRING" || form.type === "IMAGE" ? (
                    <Input value={form.valueString} onChange={(e) => setForm((f) => ({ ...f, valueString: e.target.value }))} placeholder={form.type === "IMAGE" ? "图片 URL" : "文本"} />
                  ) : null}
                  {form.type === "COLOR" ? (
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="h-9 w-14 cursor-pointer rounded border border-input bg-background"
                        value={form.valueString?.startsWith("#") ? form.valueString : "#6366f1"}
                        onChange={(e) => setForm((f) => ({ ...f, valueString: e.target.value }))}
                      />
                      <Input value={form.valueString} onChange={(e) => setForm((f) => ({ ...f, valueString: e.target.value }))} placeholder="#RRGGBB" className="font-mono" />
                    </div>
                  ) : null}
                  {form.type === "NUMBER" ? (
                    <Input type="number" value={form.valueNumber} onChange={(e) => setForm((f) => ({ ...f, valueNumber: e.target.value }))} />
                  ) : null}
                  {form.type === "BOOLEAN" ? (
                    <div className="flex items-center gap-2">
                      <Switch checked={form.valueBoolean} onCheckedChange={(c) => setForm((f) => ({ ...f, valueBoolean: c }))} id="vb" />
                      <Label htmlFor="vb">{form.valueBoolean ? "是" : "否"}</Label>
                    </div>
                  ) : null}
                  {form.type === "JSON" ? <Textarea value={form.valueJson} onChange={(e) => setForm((f) => ({ ...f, valueJson: e.target.value }))} rows={8} className="font-mono text-xs" /> : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" loading={saving} onClick={() => void handleSave()}>
                    保存
                  </Button>
                  <Button type="button" variant="outline" onClick={() => openCreate(selectedRow.id)}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    添加子项
                  </Button>
                  <Button type="button" variant="outline" className="text-destructive hover:text-destructive" onClick={() => void handleDelete()}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    删除
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card-md">
        <CardHeader>
          <CardTitle className="text-base">全部条目</CardTitle>
          <CardDescription>搜索与类型筛选；批量启用/停用。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input placeholder="搜索 key / label / 说明" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DictionaryValueType | "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {VALUE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="sm" disabled={selectedIds.size === 0} onClick={() => void batchActive(true)}>
              批量启用
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={selectedIds.size === 0} onClick={() => void batchActive(false)}>
              批量停用
            </Button>
          </div>
          <div className="overflow-x-auto rounded-md border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      aria-label="全选"
                      checked={filteredTable.length > 0 && filteredTable.every((r) => selectedIds.has(r.id))}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(new Set(filteredTable.map((r) => r.id)));
                        else setSelectedIds(new Set());
                      }}
                    />
                  </TableHead>
                  <TableHead>key</TableHead>
                  <TableHead>label</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>启用</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTable.map((r) => (
                  <TableRow key={r.id} className={cn(selectedId === r.id && "bg-muted/40")}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={(e) => {
                          setSelectedIds((prev) => {
                            const n = new Set(prev);
                            if (e.target.checked) n.add(r.id);
                            else n.delete(r.id);
                            return n;
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.key}</TableCell>
                    <TableCell>{r.label}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.isActive ? "是" : "否"}</TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(r.id)}>
                        编辑
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{createDefaults.parentId ? "新建子项" : "新建根字典"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>key（全局唯一）</Label>
              <Input className="font-mono text-xs" value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} placeholder="USER_STATUS" />
            </div>
            <div className="space-y-1.5">
              <Label>label</Label>
              <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>说明</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>类型</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as DictionaryValueType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VALUE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>排序</Label>
              <Input value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(c) => setForm((f) => ({ ...f, isActive: c }))} id="cactive" />
              <Label htmlFor="cactive">启用</Label>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">取值</p>
              {form.type === "STRING" || form.type === "IMAGE" ? (
                <Input value={form.valueString} onChange={(e) => setForm((f) => ({ ...f, valueString: e.target.value }))} placeholder={form.type === "IMAGE" ? "图片 URL" : "文本"} />
              ) : null}
              {form.type === "COLOR" ? (
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-9 w-14 cursor-pointer rounded border border-input bg-background"
                    value={form.valueString?.startsWith("#") ? form.valueString : "#6366f1"}
                    onChange={(e) => setForm((f) => ({ ...f, valueString: e.target.value }))}
                  />
                  <Input value={form.valueString} onChange={(e) => setForm((f) => ({ ...f, valueString: e.target.value }))} placeholder="#RRGGBB" className="font-mono" />
                </div>
              ) : null}
              {form.type === "NUMBER" ? <Input type="number" value={form.valueNumber} onChange={(e) => setForm((f) => ({ ...f, valueNumber: e.target.value }))} /> : null}
              {form.type === "BOOLEAN" ? (
                <div className="flex items-center gap-2">
                  <Switch checked={form.valueBoolean} onCheckedChange={(c) => setForm((f) => ({ ...f, valueBoolean: c }))} id="cfb" />
                  <Label htmlFor="cfb">{form.valueBoolean ? "是" : "否"}</Label>
                </div>
              ) : null}
              {form.type === "JSON" ? <Textarea rows={6} className="font-mono text-xs" value={form.valueJson} onChange={(e) => setForm((f) => ({ ...f, valueJson: e.target.value }))} /> : null}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              取消
            </Button>
            <Button type="button" loading={saving} onClick={() => void handleCreate()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
