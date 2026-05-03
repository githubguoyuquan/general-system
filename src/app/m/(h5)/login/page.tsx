import Link from "next/link";
import { HOT_CONFIG } from "@/lib/config-keys";
import { isFeatureEnabled } from "@/lib/features";
import { getSysConfigParsed } from "@/lib/sys-config";
import { MLoginForm } from "../../_components/m-login-form";

export default async function MLoginPage() {
  let registerOpen = false;
  let showRegisterNav = false;
  try {
    registerOpen = (await getSysConfigParsed<boolean>(HOT_CONFIG.AUTH_REGISTER_OPEN)) === true;
    showRegisterNav = await isFeatureEnabled("showRegisterNav");
  } catch {
    registerOpen = false;
    showRegisterNav = false;
  }

  const showRegister = registerOpen && showRegisterNav;

  return (
    <div className="flex min-h-[calc(100dvh-var(--h5-header)-5rem)] flex-col">
      <MLoginForm />
      <div className="mt-auto border-t border-border/60 px-4 py-4 text-center">
        {showRegister ? (
          <Link href="/m/register" className="text-sm text-primary underline-offset-4 hover:underline">
            没有账号？注册
          </Link>
        ) : (
          <p className="text-[12px] text-muted-foreground">当前环境未开放自助注册（与桌面站策略一致）</p>
        )}
      </div>
    </div>
  );
}
