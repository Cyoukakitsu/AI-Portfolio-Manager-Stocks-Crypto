"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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

function TvChartCard({
  symbol,
  showTimeRange = false,
}: {
  symbol: string;
  showTimeRange?: boolean;
}) {
  useEffect(() => {
    loadTvScript();
  }, []);

  const attrs = showTimeRange ? "show-time-range" : "show-time-scale";

  return (
    <div
      className={`${GLASS_CARD} overflow-hidden`}
      style={{ width: 220, height: 160 }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: `<tv-mini-chart symbol="${symbol}" time-frame="1M" ${attrs} style="display:block;width:220px;height:160px;"></tv-mini-chart>`,
        }}
      />
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-4 pb-10 bg-background"
      style={{
        backgroundImage: `radial-gradient(circle, color-mix(in oklch, var(--primary) 20%, transparent) 1px, transparent 1px)`,
        backgroundSize: `24px 24px`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0 }}
        className="mb-6"
      >
        <Badge className="bg-primary/10 text-primary border border-primary/30 px-4 py-1">
          {t("badge")}
        </Badge>
      </motion.div>

      <motion.h1
        className="text-5xl md:text-6xl font-serif font-bold text-center text-foreground leading-tight mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      >
        {t("headlineLine1")}
        <br />
        {t("headlinePrefix")}{" "}
        <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t("headlineAccent")}
        </span>
      </motion.h1>

      <motion.p
        className="text-lg text-muted-foreground text-center max-w-xl mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        {t("subheadline")}
      </motion.p>

      <motion.div
        className="flex gap-4 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
      >
        <Link
          href="/sign-in"
          className="px-6 py-3 min-w-36 text-center border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors"
        >
          {t("signIn")}
        </Link>
        <Link
          href="/sign-up"
          className="px-6 py-3 min-w-36 text-center bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t("signUp")}
        </Link>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <TvChartCard symbol="AMEX:SPY" />
          <TvChartCard symbol="BLACKBULL:JPN225" />
          <TvChartCard symbol="OANDA:XAUUSD" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <TvChartCard symbol="BINANCE:BTCUSDT" showTimeRange />
          <TvChartCard symbol="FX:USDJPY" showTimeRange />
          <TvChartCard symbol="FOREXCOM:CHINA50" showTimeRange />
        </div>
      </motion.div>
    </section>
  );
}
