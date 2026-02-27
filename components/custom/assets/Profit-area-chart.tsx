"use client";

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

// 占位假数据，之后替换成从交易记录计算的真实收益
const placeholderData = [
  { month: "Jan", profit: 0 },
  { month: "Feb", profit: 240 },
  { month: "Mar", profit: 180 },
  { month: "Apr", profit: 520 },
  { month: "May", profit: 390 },
  { month: "Jun", profit: 780 },
];

const chartConfig = {
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-1))",
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
              tickFormatter={(v) => `$${v}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="var(--color-profit)"
              fill="var(--color-profit)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
