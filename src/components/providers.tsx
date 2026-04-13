"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, useTheme } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AppShell } from "@/components/app-shell";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster richColors position="top-center" closeButton theme={resolvedTheme === "dark" ? "dark" : "light"} />;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AppShell>{children}</AppShell>
        <ThemedToaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
