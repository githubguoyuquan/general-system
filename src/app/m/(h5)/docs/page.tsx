import Link from "next/link";
import { BookMarked } from "lucide-react";

export const revalidate = 7200;

const blocks = [
  { title: "热配置", body: "getSysConfig / Parsed + 管理后台实时读写" },
  { title: "冷配置", body: "getColdConfig（.env，改后重启）" },
  { title: "功能开关", body: "isFeatureEnabled 统一读取" },
];

export default function MDocsPage() {
  return (
    <article className="px-4 py-6">
      <Link href="/m" className="mb-6 inline-flex text-[13px] font-medium text-primary underline-offset-4 hover:underline">
        ← 回首页
      </Link>

      <div className="flex gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/18">
          <BookMarked className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-[22px] font-semibold leading-snug tracking-tight">文档（ISR）</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            H5 专用列表排版；内容与 <span className="font-mono text-xs text-foreground/80">/docs</span> 索引一致。
          </p>
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {blocks.map((item) => (
          <li key={item.title} className="rounded-xl border border-border/75 bg-card px-4 py-4 shadow-sm">
            <h3 className="text-[15px] font-semibold">{item.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.body}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
