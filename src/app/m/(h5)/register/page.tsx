import Link from "next/link";
import { notFound } from "next/navigation";
import { HOT_CONFIG } from "@/lib/config-keys";
import { getSysConfigParsed } from "@/lib/sys-config";
import { MRegisterForm } from "../../_components/m-register-form";

export default async function MRegisterPage() {
  let open = false;
  try {
    open = (await getSysConfigParsed<boolean>(HOT_CONFIG.AUTH_REGISTER_OPEN)) === true;
  } catch {
    open = false;
  }
  if (!open) notFound();

  return (
    <div className="flex min-h-[calc(100dvh-var(--h5-header)-5rem)] flex-col">
      <MRegisterForm />
      <div className="mt-auto border-t border-border/60 px-4 py-4 text-center">
        <Link href="/m/login" className="text-sm text-primary underline-offset-4 hover:underline">
          已有账号？去登录
        </Link>
      </div>
    </div>
  );
}
