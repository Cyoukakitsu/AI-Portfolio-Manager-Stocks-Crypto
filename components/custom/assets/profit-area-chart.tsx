"use client";

// 累计收益面积图
//
// 当前使用占位数据（placeholderData），
// 后续需替换为从交易记录实时计算的真实收益曲线。
// 面积图（Area Chart）相比折线图，能更直观地表现资产增长趋势。

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

// TODO: 替换为真实数据 —— 按月汇总（当月卖出总额 - 当月买入总额）的累计值
const placeholderData = [
  { month: "Jan", profit: 0 },
  { month: "Feb", profit: 240 },
  { month: "Mar", profit: 180 },
  { month: "Apr", profit: 520 },
  { month: "May", profit: 390 },
  { month: "Jun", profit: 780 },
];

// chartConfig 用于驱动 shadcn/ui 的 ChartContainer 自动注入 CSS 变量（--color-profit）
const chartConfig = {
  profit: {
    label: "Profit",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ProfitAreaChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Overview</CardTitle>
        <CardDescription>Cumulative profit over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={placeholderData}>
            {/* strokeDasharray="3 3"：虚线网格；vertical=false：只显示水平网格线 */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              // tickFormatter 将数值格式化为带美元符号的字符串
              tickFormatter={(v) => `$${v}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"  // 平滑曲线（而非折线）
              dataKey="profit"
              stroke="var(--color-profit)"
              fill="var(--color-profit)"
              fillOpacity={0.2} // 半透明填充，让面积图视觉上不太厚重
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
