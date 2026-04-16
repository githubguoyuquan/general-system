import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  className?: string;
};

/** 全站统一的页面标题区：商业级排版（semibold + tracking-tight） */
export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.75rem]">{title}</h1>
      {description ? (
        <div className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</div>
      ) : null}
    </div>
  );
}
