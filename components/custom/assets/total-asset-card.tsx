"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssetReturn } from "@/hooks/assetsHooks/useAssetReturn";
import type { Asset } from "@/types/global";
import { LayoutDashboard } from "lucide-react";

type Props = {
  assets: Asset[];
};

export function TotalAssetCard({ assets }: Props) {
  const { totalValue } = useAssetReturn({ assets });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Assets
        </CardTitle>
        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Current portfolio value
        </p>
      </CardContent>
    </Card>
  );
}
