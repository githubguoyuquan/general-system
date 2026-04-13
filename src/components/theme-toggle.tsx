"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * 浅色 / 深色 / 跟随系统 三态循环切换（next-themes + Tailwind class dark）
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button type="button" variant="outline" size="sm" className="h-9 gap-2 px-3" disabled aria-hidden>
        <Sun className="h-4 w-4 opacity-50" />
        <span className="text-xs">主题</span>
      </Button>
    );
  }

  const cycle = () => {
    const order = ["light", "dark", "system"] as const;
    const i = order.indexOf((theme as (typeof order)[number]) || "system");
    setTheme(order[(i + 1) % order.length]);
  };

  const Icon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;
  const label =
    theme === "system" ? `系统 (${resolvedTheme === "dark" ? "深色" : "浅色"})` : theme === "dark" ? "深色" : "浅色";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 gap-2 px-3"
      onClick={cycle}
      title={`当前：${label}，点击切换`}
      aria-label={`主题：${label}，点击在浅色、深色、跟随系统间切换`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-xs tabular-nums">{label}</span>
    </Button>
  );
}
