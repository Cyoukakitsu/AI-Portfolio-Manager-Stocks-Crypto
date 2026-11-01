"use client";

// 落地页功能特性展示区块
import Image from "next/image";
import { useTranslations } from "next-intl";

const featureIds = [
  { id: "portfolio", image: "/Portfolio-Page.png" },
  { id: "ai", image: "/AI-Agent-Analysis.png" },
  { id: "stock", image: "/Stock-Page.png" },
  { id: "crypto", image: "/Crypto-Page.png" },
] as const;

export function FeaturesSection() {
  const t = useTranslations("hero.features");

  return (
    <section id="features" className="bg-background px-6 pb-20 pt-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-center text-3xl font-semibold tracking-[-0.8px] text-strong">
          {t("title")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {featureIds.map((f) => (
            <div
              key={f.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-video w-full bg-muted">
                <Image
                  src={f.image}
                  alt={t(`items.${f.id}.title`)}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-base font-semibold text-strong">
                  {t(`items.${f.id}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${f.id}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
