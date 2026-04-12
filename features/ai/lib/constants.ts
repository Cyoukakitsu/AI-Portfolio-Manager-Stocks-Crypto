import type { AgentPersona, Verdict } from "@/features/ai/types";

/** 各分析師の展示信息 */
export const PERSONA_META: Record<
  AgentPersona,
  { name: string; emoji: string; role: string; avatarUrl: string; gradientClass: string }
> = {
  buffett: {
    name: "Warren Buffett",
    emoji: "🏛️",
    role: "Father of Value Investing",
    avatarUrl: "/Warren_Buffett.png",
    gradientClass: "from-[#c2410c] via-[#9a3412] to-[#431407]",
  },
  lynch: {
    name: "Peter Lynch",
    emoji: "📈",
    role: "Growth Stock Hunter",
    avatarUrl: "/Peter_Lynch.png",
    gradientClass: "from-[#b45309] via-[#92400e] to-[#3a1500]",
  },
  wood: {
    name: "Cathie Wood",
    emoji: "🚀",
    role: "Queen of Disruptive Innovation",
    avatarUrl: "/Cathie_Wood.png",
    gradientClass: "from-[#ea580c] via-[#c2410c] to-[#431407]",
  },
  burry: {
    name: "Michael Burry",
    emoji: "🐻",
    role: "Contrarian Master",
    avatarUrl: "/Michael_Burry.png",
    gradientClass: "from-[#9a3412] via-[#7c2d12] to-[#2c0a05]",
  },
  dalio: {
    name: "Ray Dalio",
    emoji: "🌏",
    role: "Macro Cycle Hunter",
    avatarUrl: "/Ray_Dalio.png",
    gradientClass: "from-[#c2410c] via-[#9a3412] to-[#3b0f06]",
  },
};

/** verdict の展示文字 */
export const VERDICT_LABEL: Record<Verdict, string> = {
  buy:  "Buy",
  hold: "Hold",
  sell: "Sell",
};

/** verdict の badge 様式 */
export const VERDICT_STYLE: Record<Verdict, string> = {
  buy:  "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  hold: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  sell: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};
