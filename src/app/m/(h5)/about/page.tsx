import Image from "next/image";
import Link from "next/link";
/** ISR：与桌面 /about 同策略，版式为 H5 专属 */
export const revalidate = 3600;

export default function MAboutPage() {
  return (
    <article className="px-4 py-6">
      <Link href="/m" className="mb-6 inline-flex text-[13px] font-medium text-primary underline-offset-4 hover:underline">
        ← 回首页
      </Link>

      <h2 className="text-[22px] font-semibold leading-snug tracking-tight">关于（ISR）</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        H5 独立页面：单列信息密度，图示全宽铺满；与桌面路由 <code className="rounded px-1 text-xs">/about</code> 内容等价、结构不同。
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        <code className="rounded border border-border/60 bg-muted/40 px-1 py-0.5 font-mono">revalidate = 3600</code>
      </p>

      <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60 shadow-card">
        <Image
          src="https://picsum.photos/seed/general-system-m/960/540"
          alt="演示配图"
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
      </div>

      <section className="mt-6 space-y-2 rounded-xl border border-border/70 bg-card/80 px-4 py-4">
        <h3 className="text-[15px] font-semibold">静态与再验证</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">适合低频更新的说明入口；内容由 ISR 按需刷新。</p>
      </section>
    </article>
  );
}
