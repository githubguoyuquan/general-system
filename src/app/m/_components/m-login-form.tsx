"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

function Form() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/m";

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setErr("邮箱或密码错误");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="px-4 pb-6 pt-4">
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">移动端独立登录页 · 使用与 Web 相同账号</p>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="m-email" className="text-sm">
            邮箱
          </Label>
          <Input
            id="m-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="m-password" className="text-sm">
            密码
          </Label>
          <Input
            id="m-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 text-base"
          />
        </div>
        <FieldError message={err} />
        <Button type="submit" className="h-12 w-full touch-manipulation text-base" loading={loading}>
          登录
        </Button>
      </form>
    </div>
  );
}

function Fallback() {
  return (
    <div className="space-y-5 px-4 py-6">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function MLoginForm() {
  return (
    <Suspense fallback={<Fallback />}>
      <Form />
    </Suspense>
  );
}
