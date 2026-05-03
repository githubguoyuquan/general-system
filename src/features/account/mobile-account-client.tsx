"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, LogOut, Shield, User } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { AccountClientProps } from "./account-client";

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码"),
    newPassword: z.string().min(8, "新密码至少 8 位"),
    confirmPassword: z.string().min(1, "请再次输入新密码"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "两次新密码不一致",
    path: ["confirmPassword"],
  });

type SecurityForm = z.infer<typeof securitySchema>;

/** H5：纵向分区布局，不使用桌面端 Tabs（独立交互结构） */
export function MobileAccountClient({ user }: AccountClientProps) {
  const [emailOn, setEmailOn] = useState(true);
  const [marketingOn, setMarketingOn] = useState(false);

  const securityForm = useForm<SecurityForm>({
    resolver: zodResolver(securitySchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const initials =
    user.name
      ?.split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || user.email.slice(0, 2).toUpperCase();

  async function onSecuritySubmit() {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("校验通过（演示：未调用真实改密接口）");
    securityForm.reset();
  }

  function saveNotificationPrefs() {
    toast.success("已保存通知偏好（仅前端演示）");
  }

  return (
    <div className="space-y-4 px-4 py-5">
      <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <Avatar className="h-14 w-14 shrink-0">
          {user.image ? <AvatarImage src={user.image} alt="" /> : null}
          <AvatarFallback className="text-base">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1 text-sm">
          <p className="truncate font-medium">{user.name ?? "用户"}</p>
          <p className="truncate text-muted-foreground">{user.email}</p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/90">角色 · {user.role ?? "user"}</p>
        </div>
      </div>

      <section aria-labelledby="sec-profile">
        <h2 id="sec-profile" className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
          <User className="h-4 w-4" aria-hidden /> 资料
        </h2>
        <Card className="border-border/75">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">基本资料</CardTitle>
            <CardDescription className="text-xs">会话只读；长屏单列展示</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-5 text-sm">
            <Row label="用户 ID" value={<span className="font-mono text-xs break-all text-foreground">{user.id}</span>} />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section aria-labelledby="sec-security">
        <h2 id="sec-security" className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
          <Shield className="h-4 w-4" aria-hidden /> 安全
        </h2>
        <Card className="border-border/75">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">修改密码</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
              <FieldBlock label="当前密码" htmlFor="mcpw">
                <Input
                  id="mcpw"
                  type="password"
                  autoComplete="current-password"
                  className="h-12 text-base"
                  {...securityForm.register("currentPassword")}
                />
              </FieldBlock>
              <FieldError message={securityForm.formState.errors.currentPassword?.message} />

              <FieldBlock label="新密码" htmlFor="mnpw">
                <Input id="mnpw" type="password" autoComplete="new-password" className="h-12 text-base" {...securityForm.register("newPassword")} />
              </FieldBlock>
              <FieldError message={securityForm.formState.errors.newPassword?.message} />

              <FieldBlock label="确认新密码" htmlFor="mcnpw">
                <Input id="mcnpw" type="password" autoComplete="new-password" className="h-12 text-base" {...securityForm.register("confirmPassword")} />
              </FieldBlock>
              <FieldError message={securityForm.formState.errors.confirmPassword?.message} />

              <Button type="submit" className="mt-2 h-12 w-full touch-manipulation" loading={securityForm.formState.isSubmitting}>
                更新密码
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section aria-labelledby="sec-notify">
        <h2 id="sec-notify" className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
          <Bell className="h-4 w-4" aria-hidden /> 通知
        </h2>
        <Card className="border-border/75">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">偏好</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label htmlFor="m-email-notify">事务邮件</Label>
                <p className="mt-1 text-[11px] text-muted-foreground">登录与安全提醒</p>
              </div>
              <Switch id="m-email-notify" checked={emailOn} onCheckedChange={setEmailOn} className="shrink-0" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label htmlFor="m-mkt">产品资讯</Label>
                <p className="mt-1 text-[11px] text-muted-foreground">可选订阅</p>
              </div>
              <Switch id="m-mkt" checked={marketingOn} onCheckedChange={setMarketingOn} className="shrink-0" />
            </div>
            <Button type="button" variant="outline" className="h-12 w-full touch-manipulation" onClick={saveNotificationPrefs}>
              保存偏好
            </Button>
          </CardContent>
        </Card>
      </section>

      {user.role === "admin" ? (
        <>
          <Separator />
          <Button variant="outline" className="h-12 w-full touch-manipulation" asChild>
            <Link href="/m/admin/dashboard">打开移动管理后台</Link>
          </Button>
        </>
      ) : null}

      <Button
        variant="outline"
        className="h-12 w-full touch-manipulation gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        type="button"
        onClick={() => void signOut({ callbackUrl: "/m" })}
      >
        <LogOut className="h-4 w-4" aria-hidden /> 退出登录
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  );
}

function FieldBlock({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
