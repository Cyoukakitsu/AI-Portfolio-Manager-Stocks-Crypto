"use client";

// 落地页主视觉 Hero 区块与 CTA
import { useEffect, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const TV_SCRIPT_SRC =
  "https://widgets.tradingview-widget.com/w/en/tv-mini-chart.js";
const TV_CHART_WIDTH_PX = 220;
const TV_CHART_HEIGHT_PX = 160;

// 服务端渲染时不知道用户的主题（存在 localStorage 里），直接渲染会造成 hydration 不匹配；
// 用 useSyncExternalStore 区分服务端与客户端，客户端挂载后才放入图表
const subscribeNoop = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

function loadTvScript() {
  if (document.querySelector(`script[src="${TV_SCRIPT_SRC}"]`)) return;
  const script = document.createElement("script");
  script.src = TV_SCRIPT_SRC;
  script.type = "module";
  document.head.appendChild(script);
}

// 图表主题：服务端与 hydration 期间返回 null（不渲染图表），之后跟随用户主题，默认深色
function useChartTheme(): "dark" | "light" | null {
  const isClient = useIsClient();
  const { resolvedTheme } = useTheme();
  if (!isClient) return null;
  return resolvedTheme === "light" ? "light" : "dark";
}

function TvChartCard({
  symbol,
  colorTheme,
  showTimeRange = false,
}: {
  symbol: string;
  colorTheme: "dark" | "light" | null;
  showTimeRange?: boolean;
}) {
  const timeAxisAttr = showTimeRange ? "show-time-range" : "show-time-scale";

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card"
      style={{ width: TV_CHART_WIDTH_PX, height: TV_CHART_HEIGHT_PX }}
    >
      {/* 主题变化时 __html 随之变化，React 会重建元素；主题未确定时只保留占位 */}
      {colorTheme && (
        <div
          dangerouslySetInnerHTML={{
            __html: `<tv-mini-chart symbol="${symbol}" time-frame="1M" theme="${colorTheme}" ${timeAxisAttr} style="display:block;width:${TV_CHART_WIDTH_PX}px;height:${TV_CHART_HEIGHT_PX}px;"></tv-mini-chart>`,
          }}
        />
      )}
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("hero");
  const colorTheme = useChartTheme();

  useEffect(() => {
    loadTvScript();
  }, []);

  return (
    <section className="bg-dots flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-10 pt-4">
      <Badge
        variant="outline"
        className="mb-4 h-6 rounded-md px-3 text-muted-foreground"
      >
        {t("badge")}
      </Badge>

      <div className="mb-4 text-6xl font-semibold tracking-[-1.5px] text-strong md:text-7xl">
        PortfolioX
      </div>

      <h1 className="mb-4 text-center text-2xl font-semibold leading-tight tracking-[-1px] text-muted-foreground md:text-5xl">
        {t("headlineLine1")}
        <br />
        <span className="text-strong">
          {t("headlinePrefix") && <>{t("headlinePrefix")} </>}
          {t("headlineAccent")}
          {t("headlineSuffix")}
        </span>
      </h1>

      <p className="mb-10 max-w-xl text-center text-lg text-muted-foreground">
        {t("subheadline1a")}
        <br />
        {t("subheadline1b")}
      </p>

      <div className="mb-10 flex gap-4">
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ variant: "outline" }), "min-w-36")}
        >
          {t("signIn")}
        </Link>
        <Link
          href="/sign-up"
          className={cn(buttonVariants(), "min-w-36")}
        >
          {t("signUp")}
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <TvChartCard symbol="AMEX:SPY" colorTheme={colorTheme} />
          <TvChartCard symbol="BLACKBULL:JPN225" colorTheme={colorTheme} />
          <TvChartCard symbol="OANDA:XAUUSD" colorTheme={colorTheme} />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <TvChartCard symbol="BINANCE:BTCUSDT" colorTheme={colorTheme} showTimeRange />
          <TvChartCard symbol="FX:USDJPY" colorTheme={colorTheme} showTimeRange />
          <TvChartCard symbol="FOREXCOM:CHINA50" colorTheme={colorTheme} showTimeRange />
        </div>
      </div>
    </section>
  );
}
