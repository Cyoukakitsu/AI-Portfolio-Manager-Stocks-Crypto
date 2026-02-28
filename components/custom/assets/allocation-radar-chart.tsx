"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Asset } from "@/types/global";

type Prop = {
  assets: Asset[];
};

const chartConfig = {
  value: {
    label: "Allocation",
    color: "hsl(var(--chart-1))",
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
    value: Math.max(0, value), // 防止卖出超过买入时出现负值
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>Portfolio breakdown by asset type</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
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
      </CardContent>
    </Card>
  );
}
