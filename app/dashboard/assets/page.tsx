import { AssetsTable } from "@/components/custom/assets/data-table";
import { AssetForm } from "@/components/custom/assets/data-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssets } from "@/lib/assets";
import { LayoutDashboard, TrendingUp, Bitcoin } from "lucide-react";

export default async function Assets() {
  const assets = await getAssets();
  const list = assets ?? [];

  const total = list.length;
  const stockCount = list.filter((a) => a.asset_type === "stock").length;
  const cryptoCount = list.filter((a) => a.asset_type === "crypto").length;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tracked in your portfolio
            </p>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crypto
            </CardTitle>
            <Bitcoin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cryptoCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Crypto positions held
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Assets</h2>
          <AssetForm trigger={<Button size="sm">新增资产</Button>} />
        </div>
        <AssetsTable assets={list} />
      </div>
    </div>
  );
}
