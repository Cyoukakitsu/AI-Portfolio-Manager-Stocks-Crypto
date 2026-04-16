"use client";

import { motion } from "motion/react";
import { GLASS_CARD } from "../constants";

const miniAgents = [
  { initial: "B", bg: "bg-stone-700" },
  { initial: "L", bg: "bg-stone-800" },
  { initial: "W", bg: "bg-amber-800" },
  { initial: "B", bg: "bg-stone-900" },
  { initial: "D", bg: "bg-amber-900" },
];

function PortfolioDashboardMockup() {
  return (
    <div className={`${GLASS_CARD} p-4 w-full`}>
      <div className="flex gap-2 mb-3">
        {["Overview", "Stocks", "Crypto"].map((tab, i) => (
          <span
            key={tab}
            className={`px-3 py-1 text-xs rounded-md ${
              i === 0
                ? "bg-[#c9a84c] text-white"
                : "text-stone-500 bg-white/60"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 200 80" className="w-full h-16 mb-2">
        <defs>
          <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,70 L30,55 L60,45 L90,32 L120,20 L150,14 L180,8 L200,4"
          stroke="#c9a84c"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0,70 L30,55 L60,45 L90,32 L120,20 L150,14 L180,8 L200,4 L200,80 L0,80Z"
          fill="url(#portGrad)"
        />
      </svg>
      <div className="flex gap-4 text-xs">
        <div>
          <span className="text-stone-500">Total </span>
          <span className="font-semibold text-stone-800">$84,320</span>
        </div>
        <span className="text-green-500">+12.4%</span>
      </div>
    </div>
  );
}

function AIAnalysisMockup() {
  return (
    <div className={`${GLASS_CARD} p-4 w-full`}>
      <div className="flex gap-2 mb-3">
        {miniAgents.map((a, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full ${a.bg} ring-1 ring-[#c9a84c] flex items-center justify-center text-white text-xs font-bold`}
          >
            {a.initial}
          </div>
        ))}
      </div>
      <div className="text-xs text-stone-500 mb-1">Consensus Verdict</div>
      <div className="text-lg font-bold text-green-600 mb-2">Strong Buy</div>
      <div className="space-y-1">
        {[
          "Buffett: Undervalued — Hold long",
          "Lynch: Growth story intact",
          "Wood: High innovation potential",
        ].map((line) => (
          <div key={line} className="text-xs text-stone-600 truncate">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  {
    id: "portfolio",
    title: "Portfolio Management",
    mockup: <PortfolioDashboardMockup />,
    items: [
      "Multi-Asset Portfolio View",
      "Real-time Price Tracking",
      "Performance Analytics",
      "Custom Goal Tracking",
    ],
    reverse: false,
  },
  {
    id: "ai",
    title: "AI Analysis",
    mockup: <AIAnalysisMockup />,
    items: [
      "5 Legendary Investor Strategies",
      "Real-time AI Insights",
      "Multi-Agent Debate System",
      "Risk Assessment",
    ],
    reverse: true,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 bg-[#f5f0e8]">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="text-3xl font-bold text-center text-stone-800 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Core Features
        </motion.h2>
        <div className="space-y-20">
          {features.map((f) => (
            <motion.div
              key={f.id}
              className={`flex flex-col ${
                f.reverse ? "md:flex-row-reverse" : "md:flex-row"
              } gap-10 items-center`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex-1 w-full">{f.mockup}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-800 mb-6">
                  {f.title}
                </h3>
                <ul className="space-y-3">
                  {f.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-stone-600"
                    >
                      <span className="text-[#c9a84c] font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
