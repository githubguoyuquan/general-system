import { MobileAdminShell } from "@/components/layout/mobile-admin-shell";

export default function MAdminLayout({ children }: { children: React.ReactNode }) {
  return <MobileAdminShell>{children}</MobileAdminShell>;
}
