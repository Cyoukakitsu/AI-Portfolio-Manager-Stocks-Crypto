"use client";

import { useEffect } from "react";
import { useAssetReturn } from "@/hooks/assetsHooks/useAssetReturn";
import type { Asset } from "@/types/global";
import { Wallet } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

type Props = { assets: Asset[] };

export function TotalAssetCard({ assets }: Props) {
  const { totalValue, totalReturn, totalReturnPct } = useAssetReturn({
    assets,
  });

  const isPositive = totalReturn >= 0;
  const returnColor = isPositive
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-500 dark:text-red-400";

  const rawValue = useMotionValue(0);
  const springValue = useSpring(rawValue, { stiffness: 80, damping: 20 });
  const displayValue = useTransform(springValue, (v) => `$${v.toFixed(2)}`);

  const rawReturn = useMotionValue(0);
  const springReturn = useSpring(rawReturn, { stiffness: 80, damping: 20 });
  const displayReturn = useTransform(
    springReturn,
    (v) => `${v >= 0 ? "+" : ""}$${v.toFixed(2)}`,
  );

  const rawPct = useMotionValue(0);
  const springPct = useSpring(rawPct, { stiffness: 80, damping: 20 });
  const displayPct = useTransform(
    springPct,
    (v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`,
  );

  useEffect(() => {
    rawValue.set(totalValue);
    rawReturn.set(totalReturn);
    rawPct.set(totalReturnPct ?? 0);
  }, [totalValue, totalReturn, totalReturnPct, rawValue, rawReturn, rawPct]);

  return (
    <motion.div
      className="group rounded-xl border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" as const }}
    >
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border/60">
        <span className="flex items-center justify-center h-6 w-6 rounded-lg shrink-0 bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400">
          <Wallet className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-semibold tracking-tight">
          Portfolio Summary
        </span>
      </div>
      <div className="px-5 py-3 flex items-center">
        <div className="flex-1 flex justify-center">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Total Assets
            </p>
            <motion.div className="text-3xl font-bold tabular-nums">
              {displayValue}
            </motion.div>
          </div>
        </div>
        <div className="w-px h-10 bg-border/60 shrink-0" />
        <div className="flex-1 flex justify-center">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Total Return
            </p>
            <motion.div className={`text-xl font-bold tabular-nums ${returnColor}`}>
              {displayReturn}
            </motion.div>
            <motion.p className={`text-xs tabular-nums ${returnColor}`}>
              {totalReturnPct !== null ? displayPct : "—"}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
