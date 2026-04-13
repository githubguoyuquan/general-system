import Link from "next/link";
import { notFound } from "next/navigation";
import { HOT_CONFIG } from "@/lib/config-keys";
import { getSysConfigParsed } from "@/lib/sys-config";
import { RegisterForm } from "./register-form";

/**
 * 注册页：由热配置 auth.register_open 控制是否可访问。
 */
export default async function RegisterPage() {
  let open = false;
  try {
    open = (await getSysConfigParsed<boolean>(HOT_CONFIG.AUTH_REGISTER_OPEN)) === true;
  } catch {
    open = false;
  }
  if (!open) notFound();

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-4 bg-muted/30 p-6">
      <RegisterForm />
      <Link href="/login" className="text-sm text-muted-foreground underline">
        已有账号？去登录
      </Link>
    </div>
  );
}
