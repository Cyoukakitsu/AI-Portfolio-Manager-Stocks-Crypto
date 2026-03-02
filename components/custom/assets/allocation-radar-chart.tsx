"use client";

// 资产配置雷达图（按资产类型展示持仓成本分布）
//
// 设计意图：雷达图（蛛网图）适合对比多个维度，
// 这里用来展示不同资产类型（股票/加密/ETF/现金）各占总成本的比重。

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

// ChartConfig 告诉 shadcn/ui 的 ChartContainer 如何渲染图例和 Tooltip 标签
const chartConfig = {
  value: {
    label: "Allocation",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AllocationRadarChart({ assets }: Prop) {
  // 将资产列表按 asset_type 分组并累加 total_cost，
  // 得到每种资产类型的总持仓成本（用于雷达图各轴的数值）
  const costByType = assets.reduce<Record<string, number>>((acc, asset) => {
    const type = asset.asset_type;
    acc[type] = (acc[type] ?? 0) + asset.total_cost;
    return acc;
  }, {});

  const chartData = Object.entries(costByType).map(([type, value]) => ({
    type,
    // 边界条件：total_cost 可能为负（卖出金额超过买入），对图表没有意义，取 0 兜底
    value: Math.max(0, value),
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
            {/* dataKey="type" 让每个资产类型名称显示在雷达图的各个顶点上 */}
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
