"use client";

import Script from "next/script";
import { useTheme } from "next-themes";

export function CoinHeatmap() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const bgColor = isDark ? "#09090b" : "#ffffff";
  const fontColor = isDark ? "#fafafa" : "#09090b";

  return (
    <>
      <Script
        src="https://widgets.coingecko.com/gecko-coin-heatmap-widget.js"
        strategy="lazyOnload"
      />
      {/* @ts-ignore */}
      <gecko-coin-heatmap-widget
        locale="en"
        outlined="false"
        top="100"
        height="500"
        background-color={bgColor}
        font-color={fontColor}
      />
    </>
  );
}
