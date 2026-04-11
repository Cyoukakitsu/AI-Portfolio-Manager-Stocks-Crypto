"use client";

// 资产配置雷达图（按资产类型展示持仓成本分布）
//
// 内层不再包 Card — 由页面的 WidgetCard 提供容器

import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Asset } from "@/types/global";

type Prop = { assets: Asset[] };

const chartConfig = {
  value: {
    label: "Allocation",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function AllocationRadarChart({ assets }: Prop) {
  const costByType = assets.reduce<Record<string, number>>((acc, asset) => {
    const type = asset.asset_type;
    acc[type] = (acc[type] ?? 0) + asset.total_cost;
    return acc;
  }, {});

  const chartData = Object.entries(costByType).map(([type, value]) => ({
    type,
    value: Math.max(0, value),
  }));

  return (
    <ChartContainer config={chartConfig} className="h-65 w-full">
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="type" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Radar
          dataKey="value"
          stroke="var(--color-value)"
          fill="var(--color-value)"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ChartContainer>
  );
}
