import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "react-day-picker/style.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { HOT_CONFIG } from "@/lib/config-keys";
import { getSysConfigParsed } from "@/lib/sys-config";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "通用系统模板",
  description: "Next.js + Auth + 配置中心 雏形",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let maintenance = false;
  try {
    maintenance = (await getSysConfigParsed<boolean>(HOT_CONFIG.MAINTENANCE_MODE)) === true;
  } catch {
    /* 数据库未就绪时仍渲染子应用，避免开发期白屏 */
  }

  if (maintenance) {
    return (
      <html lang="zh-CN" suppressHydrationWarning>
        <body
          className={`${geist.variable} ${geistMono.variable} font-sans min-h-screen flex items-center justify-center bg-[hsl(240_4%_11%)] text-[hsl(240_5%_92%)] dark`}
        >
          <div className="text-center space-y-2 p-8">
            <p className="text-xl font-semibold tracking-tight">系统维护中</p>
            <p className="text-sm text-[hsl(220_5%_58%)]">maintenance.mode 已在配置中心开启</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-[hsl(var(--surface-base))]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
