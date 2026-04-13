"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** App Router 错误边界：捕获子树内未处理异常 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-lg font-semibold">页面出错了</h2>
      <p className="text-sm text-muted-foreground max-w-md text-center">{error.message}</p>
      <Button type="button" onClick={() => reset()}>
        重试
      </Button>
    </div>
  );
}
