"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { GLASS_CARD } from "../constants";

const TV_SCRIPT_SRC =
  "https://widgets.tradingview-widget.com/w/en/tv-mini-chart.js";

let scriptLoaded = false;

function loadTvScript() {
  if (scriptLoaded || document.querySelector(`script[src="${TV_SCRIPT_SRC}"]`))
    return;
  scriptLoaded = true;
  const script = document.createElement("script");
  script.src = TV_SCRIPT_SRC;
  script.type = "module";
  document.head.appendChild(script);
}

function TvChartCard({ symbol }: { symbol: string }) {
  useEffect(() => {
    loadTvScript();
  }, []);

  return (
    <div
      className={`${GLASS_CARD} overflow-hidden`}
      style={{ width: 220, height: 160 }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: `<tv-mini-chart symbol="${symbol}" time-frame="1M" show-time-scale style="display:block;width:220px;height:160px;"></tv-mini-chart>`,
        }}
      />
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
        <span className="bg-linear-to-r from-[#c9a84c] to-[#e8c96a] bg-clip-text text-transparent">
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
        className="flex gap-4 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
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

      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
      >
        <TvChartCard symbol="AMEX:SPY" />
        <TvChartCard symbol="BLACKBULL:JPN225" />
        <TvChartCard symbol="OANDA:XAUUSD" />
      </motion.div>
    </section>
  );
}
