"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssetReturn } from "@/hooks/assetsHooks/useAssetReturn";
import type { Asset } from "@/types/global";
import { TrendingUp } from "lucide-react";

type Props = {
  assets: Asset[];
};

export function TotalReturnCard({ assets }: Props) {
  const { totalReturn, totalReturnPct } = useAssetReturn({ assets });

  const isPositive = totalReturn >= 0;
  const color = isPositive
    ? "text-green-500 dark:text-green-400"
    : "text-red-500 dark:text-red-400";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Return
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>
          {isPositive ? "+" : ""}
          {totalReturn.toFixed(2)}
        </div>
        <p className={`text-xs mt-1 ${color}`}>
          {totalReturnPct !== null
            ? `${isPositive ? "+" : ""}${totalReturnPct.toFixed(2)}%`
            : "—"}
        </p>
      </CardContent>
    </Card>
  );
}
