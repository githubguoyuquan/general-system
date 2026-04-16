"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import type { ApiResponse } from "@/types/api";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    const json = (await res.json()) as ApiResponse<{ email: string }>;
    setLoading(false);
    if (json.code !== 0) {
      setErr(json.message || "注册失败");
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-card-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold tracking-tight">注册</CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">由热配置 auth.register_open 控制是否开放</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">昵称（可选）</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码（至少 8 位）</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <FieldError message={err} />
          <Button type="submit" className="w-full transition-all duration-300" loading={loading}>
            注册
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
