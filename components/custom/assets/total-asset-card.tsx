"use client";

import { useEffect } from "react";
import { useAssetReturn } from "@/hooks/assetsHooks/useAssetReturn";
import type { Asset } from "@/types/global";
import { LayoutDashboard } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

type Props = { assets: Asset[] };

export function TotalAssetCard({ assets }: Props) {
  const { totalValue } = useAssetReturn({ assets });

  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => `$${v.toFixed(2)}`);

  useEffect(() => {
    raw.set(totalValue);
  }, [totalValue, raw]);

  return (
    <motion.div
      className="group rounded-xl border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" as const }}
    >
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/60">
        <span className="flex items-center justify-center h-7 w-7 rounded-lg shrink-0 bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400">
          <LayoutDashboard className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Total Assets</span>
      </div>
      <div className="px-5 py-4">
        <motion.div className="text-2xl font-bold tabular-nums">{display}</motion.div>
        <p className="text-xs text-muted-foreground mt-1">Current portfolio value</p>
      </div>
    </motion.div>
  );
}
