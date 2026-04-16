"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Bot, TrendingUp, PieChart } from "lucide-react";
import { GLASS_CARD } from "../constants";

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}</span>;
}

const statsMeta = [
  { icon: Bot,        label: "AI Agents",    description: "Legendary investor strategies", countTo: 5,   text: null },
  { icon: TrendingUp, label: "Asset Classes", description: "Real-time market data",         countTo: null, text: "Stocks & Crypto" },
  { icon: PieChart,   label: "Tracking",      description: "Multi-asset management",        countTo: null, text: "Portfolio" },
];

export function StatsBar() {
  return (
    <section className="py-16 px-6 bg-[#f5f0e8]">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsMeta.map(({ icon: Icon, label, description, countTo, text }, i) => (
          <motion.div
            key={label}
            className={`${GLASS_CARD} p-6 text-center`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
          >
            <Icon className="w-8 h-8 text-[#c9a84c] mx-auto mb-3" />
            <div className="text-3xl font-bold text-stone-800 mb-1">
              {countTo !== null ? <CountUp target={countTo} /> : text}
            </div>
            <div className="text-sm font-semibold text-stone-700">{label}</div>
            <div className="text-xs text-stone-500 mt-1">{description}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
