"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Search, Trash2, Eye } from "lucide-react";
import { PageFade } from "@/components/page-fade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMockUsers } from "@/hooks/use-mock-users";
import type { MockUser } from "@/lib/mock";
import { MOCK_DEPARTMENTS, MOCK_ROLE_OPTIONS, MOCK_STATUS_OPTIONS } from "@/lib/mock";

/** 数据表格 CRUD 模板：逻辑在 hook + mock-user.service，本组件仅负责 UI */
export function CrudUsersTemplate() {
  const u = useMockUsers(5);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewUser, setViewUser] = useState<MockUser | null>(null);
  const [editing, setEditing] = useState<MockUser | null>(null);
  const [form, setForm] = useState<{
    email: string;
    name: string;
    role: MockUser["role"];
    status: MockUser["status"];
    department: string;
  }>({
    email: "",
    name: "",
    role: "user",
    status: "active",
    department: MOCK_DEPARTMENTS[0]!,
  });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(u.total / u.pageSize)), [u.total, u.pageSize]);

  useEffect(() => {
    if (u.page > totalPages) u.setPage(totalPages);
  }, [u.page, totalPages, u.setPage]); // eslint-disable-line react-hooks/exhaustive-deps -- hook 返回对象每帧变，不列入 u

  function openCreate() {
    setEditing(null);
    setForm({
      email: "",
      name: "",
      role: "user",
      status: "active",
      department: MOCK_DEPARTMENTS[0]!,
    });
    setDialogOpen(true);
  }

  function openEdit(row: MockUser) {
    setEditing(row);
    setForm({
      email: row.email,
      name: row.name,
      role: row.role,
      status: row.status,
      department: row.department,
    });
    setDialogOpen(true);
  }

  async function submitForm() {
    await u.createOrUpdate({
      id: editing?.id,
      email: form.email.trim(),
      name: form.name.trim(),
      role: form.role,
      status: form.status,
      department: form.department,
    });
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除该用户？（MOCK 数据）")) return;
    await u.remove(id);
  }

  return (
    <PageFade className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">数据表格 CRUD</h1>
        <p className="text-sm text-muted-foreground mt-1">
          搜索 / 筛选 / 分页 · 弹窗表单 · 行操作菜单。数据来自{" "}
          <code className="rounded bg-muted px-1 text-xs">mock-user.service</code>
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">用户列表</CardTitle>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新增
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <Label>关键词</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="姓名 / 邮箱 / 部门"
                  value={u.q}
                  onChange={(e) => {
                    u.setQ(e.target.value);
                    u.setPage(1);
                  }}
                />
              </div>
            </div>
            <div className="w-full min-w-[140px] space-y-1.5 md:w-40">
              <Label>角色</Label>
              <Select
                value={u.role}
                onValueChange={(v) => {
                  u.setRole(v);
                  u.setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {MOCK_ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full min-w-[140px] space-y-1.5 md:w-40">
              <Label>状态</Label>
              <Select
                value={u.status}
                onValueChange={(v) => {
                  u.setStatus(v);
                  u.setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {MOCK_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-[100px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {u.loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : u.items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{row.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{row.role}</Badge>
                        </TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell>
                          <Badge variant={row.status === "active" ? "default" : "outline"}>
                            {row.status === "active" ? "启用" : "停用"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewUser(row)}>
                                <Eye className="mr-2 h-4 w-4" />
                                查看
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(row)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => void handleDelete(row.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          {!u.loading && u.items.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">暂无数据</p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <span>
              共 {u.total} 条 · 第 {u.page} / {totalPages} 页
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={u.page <= 1 || u.loading} onClick={() => u.setPage((p) => p - 1)}>
                上一页
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={u.page >= totalPages || u.loading}
                onClick={() => u.setPage((p) => p + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑用户" : "新增用户"}</DialogTitle>
            <DialogDescription>提交后通过 mock 服务写入内存并刷新表格。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                disabled={Boolean(editing)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as MockUser["role"] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as MockUser["status"] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>部门</Label>
              <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={() => void submitForm()} disabled={!form.email || !form.name}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewUser)} onOpenChange={() => setViewUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
          </DialogHeader>
          {viewUser ? (
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">ID</dt>
                <dd className="font-mono text-xs">{viewUser.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">邮箱</dt>
                <dd>{viewUser.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">创建时间</dt>
                <dd>{new Date(viewUser.createdAt).toLocaleString("zh-CN")}</dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageFade>
  );
}
