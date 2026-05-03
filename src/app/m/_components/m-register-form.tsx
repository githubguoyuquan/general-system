"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiResponse } from "@/types/api";

export function MRegisterForm() {
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
    router.push("/m/login");
    router.refresh();
  }

  return (
    <div className="px-4 pb-6 pt-4">
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">移动端开户 · 与 Web 共用同一后端</p>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="mr-name">昵称（可选）</Label>
          <Input id="mr-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className="h-12 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mr-email">邮箱</Label>
          <Input
            id="mr-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mr-password">密码（至少 8 位）</Label>
          <Input
            id="mr-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 text-base"
            autoComplete="new-password"
          />
        </div>
        <FieldError message={err} />
        <Button type="submit" className="h-12 w-full touch-manipulation text-base" loading={loading}>
          注册
        </Button>
      </form>
    </div>
  );
}
