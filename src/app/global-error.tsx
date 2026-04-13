"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-lg font-semibold">全局错误</h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button type="button" onClick={() => reset()}>
          重试
        </Button>
      </body>
    </html>
  );
}
