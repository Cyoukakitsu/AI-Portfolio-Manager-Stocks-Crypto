import { AssetsTable } from "@/components/custom/assets/data-table";
import { AssetForm } from "@/components/custom/assets/data-form";
import { Button } from "@/components/ui/button";
import { getAssets } from "@/lib/assets";

export default async function Assets() {
  const assets = await getAssets();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="flex justify-end">
        <AssetForm trigger={<Button>新增资产</Button>} />
      </div>
      <AssetsTable assets={assets ?? []} />
    </div>
  );
}
