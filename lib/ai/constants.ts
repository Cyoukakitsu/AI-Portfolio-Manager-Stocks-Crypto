import type { AgentPersona, Verdict } from "@/types/ai";

/** 各分析师的展示信息 */
export const PERSONA_META: Record<
  AgentPersona,
  { name: string; emoji: string; role: string }
> = {
  buffett: { name: "Warren Buffett", emoji: "🏛️", role: "Father of Value Investing" },
  lynch:   { name: "Peter Lynch",    emoji: "📈", role: "Growth Stock Hunter" },
  wood:    { name: "Cathie Wood",    emoji: "🚀", role: "Queen of Disruptive Innovation" },
  burry:   { name: "Michael Burry",  emoji: "🐻", role: "Contrarian Master" },
  dalio:   { name: "Ray Dalio",      emoji: "🌏", role: "Macro Cycle Hunter" },
};

/** verdict 的展示文字 */
export const VERDICT_LABEL: Record<Verdict, string> = {
  buy:  "Buy",
  hold: "Hold",
  sell: "Sell",
};

/** verdict 的 badge 样式 */
export const VERDICT_STYLE: Record<Verdict, string> = {
  buy:  "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  hold: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  sell: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};
