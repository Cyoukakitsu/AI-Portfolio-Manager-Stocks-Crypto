"use client";

import { useEffect } from "react";
import { useAssetReturn } from "@/hooks/assetsHooks/useAssetReturn";
import type { Asset } from "@/types/global";
import { TrendingUp } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

type Props = { assets: Asset[] };

export function TotalReturnCard({ assets }: Props) {
  const { totalReturn, totalReturnPct } = useAssetReturn({ assets });

  const isPositive = totalReturn >= 0;
  const valueColor = isPositive
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-500 dark:text-red-400";
  const iconAccent = isPositive
    ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400"
    : "bg-red-500/10 text-red-500 dark:bg-red-400/10 dark:text-red-400";

  const rawReturn = useMotionValue(0);
  const springReturn = useSpring(rawReturn, { stiffness: 80, damping: 20 });
  const displayReturn = useTransform(springReturn, (v) =>
    `${v >= 0 ? "+" : ""}${v.toFixed(2)}`,
  );

  const rawPct = useMotionValue(0);
  const springPct = useSpring(rawPct, { stiffness: 80, damping: 20 });
  const displayPct = useTransform(springPct, (v) =>
    `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`,
  );

  useEffect(() => {
    rawReturn.set(totalReturn);
    rawPct.set(totalReturnPct ?? 0);
  }, [totalReturn, totalReturnPct, rawReturn, rawPct]);

  return (
    <motion.div
      className="group rounded-xl border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" as const, delay: 0.08 }}
    >
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/60">
        <span className={`flex items-center justify-center h-7 w-7 rounded-lg shrink-0 ${iconAccent}`}>
          <TrendingUp className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Total Return</span>
      </div>
      <div className="px-5 py-4">
        <motion.div className={`text-2xl font-bold tabular-nums ${valueColor}`}>
          {displayReturn}
        </motion.div>
        <motion.p className={`text-xs mt-1 tabular-nums ${valueColor}`}>
          {totalReturnPct !== null ? displayPct : "—"}
        </motion.p>
      </div>
    </motion.div>
  );
}
