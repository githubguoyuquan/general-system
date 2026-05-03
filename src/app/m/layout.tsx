import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "移动端 · 通用系统模板", template: "%s · H5" },
  description: "独立移动站 /m，不与桌面端共用页面结构",
  appleWebApp: { capable: true, title: "通用系统" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function MLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
