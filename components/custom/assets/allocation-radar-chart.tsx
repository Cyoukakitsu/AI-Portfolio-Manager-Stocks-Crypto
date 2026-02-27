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

// 占位假数据，之后替换成从资产列表计算的真实比例
const placeholderData = [
  { type: "Crypto", value: 40 },
  { type: "Stock", value: 30 },
  { type: "ETF", value: 20 },
  { type: "Cash", value: 10 },
];

const chartConfig = {
  value: {
    label: "Allocation",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AllocationRadarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>Portfolio breakdown by asset type</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <RadarChart data={placeholderData}>
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
