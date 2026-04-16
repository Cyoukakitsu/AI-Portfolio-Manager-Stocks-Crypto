"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { GLASS_CARD } from "../constants";

function AAPLCard() {
  return (
    <div className={`${GLASS_CARD} p-4 min-w-[160px]`}>
      <div className="text-xs text-stone-500 mb-1">AAPL</div>
      <svg viewBox="0 0 120 50" className="w-full h-10 mb-2">
        <defs>
          <linearGradient id="aaplGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,45 L20,38 L40,30 L60,22 L80,16 L100,10 L120,5"
          stroke="#22c55e"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0,45 L20,38 L40,30 L60,22 L80,16 L100,10 L120,5 L120,50 L0,50Z"
          fill="url(#aaplGrad)"
        />
      </svg>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-stone-800">$182.63</span>
        <span className="text-xs text-green-500">+2.3%</span>
      </div>
    </div>
  );
}

function BTCCard() {
  const candles = [
    { x: 15, top: 30, h: 14, wick_top: 26, wick_bot: 48, green: true },
    { x: 35, top: 22, h: 16, wick_top: 18, wick_bot: 42, green: false },
    { x: 55, top: 18, h: 12, wick_top: 14, wick_bot: 34, green: true },
    { x: 75, top: 12, h: 14, wick_top: 8,  wick_bot: 30, green: true },
    { x: 95, top: 8,  h: 10, wick_top: 4,  wick_bot: 22, green: true },
  ];

  return (
    <div className={`${GLASS_CARD} p-4 min-w-[160px]`}>
      <div className="text-xs text-stone-500 mb-1">BTC/USD</div>
      <svg viewBox="0 0 120 50" className="w-full h-10 mb-2">
        {candles.map((c) => (
          <g key={c.x}>
            <line
              x1={c.x}
              y1={c.wick_top}
              x2={c.x}
              y2={c.wick_bot}
              stroke={c.green ? "#22c55e" : "#ef4444"}
              strokeWidth="1"
            />
            <rect
              x={c.x - 5}
              y={c.top}
              width="10"
              height={c.h}
              fill={c.green ? "#22c55e" : "#ef4444"}
              rx="1"
            />
          </g>
        ))}
      </svg>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-stone-800">$43,250</span>
        <span className="text-xs text-green-500">+1.8%</span>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-4 pb-24 relative"
      style={{
        backgroundImage: `radial-gradient(circle, #c9a84c33 1px, transparent 1px)`,
        backgroundSize: `24px 24px`,
        backgroundColor: "#f5f0e8",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0 }}
        className="mb-6"
      >
        <Badge className="bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30 px-4 py-1">
          ✦ AI-Powered · Stock · Crypto
        </Badge>
      </motion.div>

      <motion.h1
        className="text-5xl md:text-6xl font-serif font-bold text-center text-stone-800 leading-tight mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      >
        Your Portfolio,
        <br />
        Analyzed by{" "}
        <span className="bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] bg-clip-text text-transparent">
          Legends
        </span>
      </motion.h1>

      <motion.p
        className="text-lg text-stone-500 text-center max-w-xl mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        Track stocks &amp; crypto. Get AI insights from 5 legendary investors.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
      >
        <AAPLCard />
        <BTCCard />
      </motion.div>

      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
      >
        <Link
          href="/sign-in"
          className="px-6 py-3 bg-[#c9a84c] text-white font-semibold rounded-lg hover:bg-[#b8973b] transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="px-6 py-3 border-2 border-[#c9a84c] text-[#c9a84c] font-semibold rounded-lg hover:bg-[#c9a84c]/10 transition-colors"
        >
          Sign Up
        </Link>
      </motion.div>
    </section>
  );
}
