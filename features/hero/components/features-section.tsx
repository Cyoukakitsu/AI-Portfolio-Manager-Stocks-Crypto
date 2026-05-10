"use client";

import Image from "next/image";
import { motion } from "motion/react";
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
    <section
      id="features"
      className="pt-10 pb-20 px-6 bg-background"
      style={{
        backgroundImage: `radial-gradient(circle, color-mix(in oklch, var(--primary) 20%, transparent) 1px, transparent 1px)`,
        backgroundSize: `24px 24px`,
      }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="text-3xl font-bold text-center text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t("title")}
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {featureIds.map((f, i) => (
            <motion.div
              key={f.id}
              className="bg-white/40 dark:bg-card backdrop-blur-md border border-[#c9a84c]/30 dark:border-border rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="relative w-full aspect-video bg-muted">
                <Image
                  src={f.image}
                  alt={t(`items.${f.id}.title`)}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-card-foreground mb-2">
                  {t(`items.${f.id}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground dark:text-foreground/70 leading-relaxed">
                  {t(`items.${f.id}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
