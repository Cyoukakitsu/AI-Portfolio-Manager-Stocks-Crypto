"use client";

// 持仓概览卡片
// 统计各资产类型（股票 / ETF / 加密货币）的持仓数量，以数字形式展示

import type { Asset } from "@/types/global";
import { BarChart3 } from "lucide-react";
import { motion } from "motion/react";

type Props = { assets: Asset[] };

export function TotalReturnCard({ assets }: Props) {
  // 按资产类型分组统计数量，顺序固定为 Stock → ETF → Crypto
  const types = [
    { type: "stock",  label: "Stock",  count: assets.filter((a) => a.asset_type === "stock").length },
    { type: "etf",    label: "ETF",    count: assets.filter((a) => a.asset_type === "etf").length },
    { type: "crypto", label: "Crypto", count: assets.filter((a) => a.asset_type === "crypto").length },
  ];

  return (
    <motion.div
      className="group rounded-xl border border-border/60 bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" as const, delay: 0.08 }}
    >
      {/* 卡片标题栏 */}
      <div className="flex items-center gap-3 px-3 sm:px-5 py-2.5 border-b border-border/60">
        <span className="flex items-center justify-center h-6 w-6 rounded-lg shrink-0 bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400">
          <BarChart3 className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Holdings</span>
      </div>

      {/* 三列数字：各类型持仓数量 */}
      <div className="px-3 sm:px-5 py-3 flex items-center justify-between">
        {types.map(({ type, label, count }) => (
          <div key={type} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground">{label}</span>
            {/* tabular-nums 保证数字等宽，对齐美观 */}
            <span className="text-xl font-bold tabular-nums">{count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
