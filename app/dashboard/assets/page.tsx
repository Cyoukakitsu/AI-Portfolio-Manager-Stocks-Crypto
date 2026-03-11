import { AssetsTable } from "@/components/custom/assets/data-table";
import { AssetForm } from "@/components/custom/assets/data-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssets } from "@/services/assets";
import { TrendingUp } from "lucide-react";
import { ProfitAreaChart } from "@/components/custom/assets/profit-area-chart";
import { AllocationRadarChart } from "@/components/custom/assets/allocation-radar-chart";
import { TotalReturnCard } from "@/components/custom/assets/total-return-card";
import { TotalAssetCard } from "@/components/custom/assets/total-asset-card";
import { getAllTransactions } from "@/services/transactions";

export default async function Assets() {
  const assets = await getAssets();
  const list = assets ?? [];
  const stockCount = list.filter((a) => a.asset_type === "stock").length;

  const allTransactions = await getAllTransactions();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <TotalAssetCard assets={list} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stocks
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Stock positions held
            </p>
          </CardContent>
        </Card>

        <TotalReturnCard assets={list} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <ProfitAreaChart assets={list} allTransactions={allTransactions} />
        </div>
        <div className="md:col-span-1">
          <AllocationRadarChart assets={list} />
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Assets</h2>
          <AssetForm trigger={<Button size="sm">Add Asset</Button>} />
        </div>
        <AssetsTable assets={list} />
      </div>
    </div>
  );
}
