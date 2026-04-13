"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Shield, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageFade } from "@/components/page-fade";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export type AccountClientProps = {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role?: string;
  };
};

export function AccountClient({ user }: AccountClientProps) {
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
    <PageFade className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">个人中心</h1>
        <p className="text-sm text-muted-foreground mt-1">资料 · 安全 · 通知（Tabs + zod + Sonner）</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto flex-wrap gap-1 sm:flex-nowrap">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4 shrink-0" />
            资料
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-4 w-4 shrink-0" />
            安全
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-4 w-4 shrink-0" />
            通知
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>基本资料</CardTitle>
              <CardDescription>来自登录会话，只读展示（可后续接编辑资料 API）。</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar className="h-20 w-20">
                {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-3 flex-1 text-sm">
                <div>
                  <p className="text-muted-foreground">姓名</p>
                  <p className="font-medium">{user.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">邮箱</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">角色</p>
                  <p className="font-medium">{user.role ?? "user"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">用户 ID</p>
                  <p className="font-mono text-xs break-all">{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>修改密码</CardTitle>
              <CardDescription>前端校验雏形：旧密码必填、新密码长度、确认一致；提交仅 Toast，不接后端。</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">当前密码</Label>
                  <Input id="currentPassword" type="password" autoComplete="current-password" {...securityForm.register("currentPassword")} />
                  {securityForm.formState.errors.currentPassword ? (
                    <p className="text-sm text-destructive">{securityForm.formState.errors.currentPassword.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">新密码</Label>
                  <Input id="newPassword" type="password" autoComplete="new-password" {...securityForm.register("newPassword")} />
                  {securityForm.formState.errors.newPassword ? (
                    <p className="text-sm text-destructive">{securityForm.formState.errors.newPassword.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <Input id="confirmPassword" type="password" autoComplete="new-password" {...securityForm.register("confirmPassword")} />
                  {securityForm.formState.errors.confirmPassword ? (
                    <p className="text-sm text-destructive">{securityForm.formState.errors.confirmPassword.message}</p>
                  ) : null}
                </div>
                <Button type="submit" disabled={securityForm.formState.isSubmitting}>
                  {securityForm.formState.isSubmitting ? "校验中…" : "更新密码"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>通知偏好</CardTitle>
              <CardDescription>本地开关演示，可替换为与用户设置 API 同步。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="email-notify">事务类邮件</Label>
                  <p className="text-xs text-muted-foreground">登录提醒、安全告警等</p>
                </div>
                <Switch id="email-notify" checked={emailOn} onCheckedChange={setEmailOn} />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="marketing">产品资讯与活动</Label>
                  <p className="text-xs text-muted-foreground">可选订阅，可随时关闭</p>
                </div>
                <Switch id="marketing" checked={marketingOn} onCheckedChange={setMarketingOn} />
              </div>
              <Button type="button" variant="outline" onClick={saveNotificationPrefs}>
                保存偏好
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageFade>
  );
}
