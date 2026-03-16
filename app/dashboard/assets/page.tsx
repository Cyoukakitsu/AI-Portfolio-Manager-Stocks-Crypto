import { Button } from "@/components/ui/button";

import { getAssets } from "@/server/assets";
import { getAllTransactions } from "@/server/transactions";

import { AssetsTable } from "@/components/custom/assets/data-table";
import { AssetForm } from "@/components/custom/assets/data-form";
import { AllocationRadarChart } from "@/components/custom/assets/allocation-radar-chart";
import { TotalReturnCard } from "@/components/custom/assets/total-return-card";
import { TotalAssetCard } from "@/components/custom/assets/total-asset-card";
import { PortfolioCandlestickChart } from "@/components/custom/assets/portfolio-candlestick-chart";

export default async function Assets() {
  const assets = await getAssets();
  const list = assets ?? [];

  const allTransactions = await getAllTransactions();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <TotalAssetCard assets={list} />

        <TotalReturnCard assets={list} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <PortfolioCandlestickChart
            assets={list}
            allTransactions={allTransactions}
          />
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
