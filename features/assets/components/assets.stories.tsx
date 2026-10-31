import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { sampleAssets, withSeededQuotes } from "@/features/assets/stories/sample-assets";
import { TotalAssetCard } from "./total-asset-card";
import { AssetsTable } from "./asset-table";

// 资产页关键组件的视觉验收，用示例数据，不依赖登录与后端。
const Seeded = withSeededQuotes(sampleAssets);

const meta = { title: "Assets/Page" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const TotalAsset: Story = {
  render: () => (
    <Seeded>
      <div className="max-w-3xl">
        <TotalAssetCard assets={sampleAssets} />
      </div>
    </Seeded>
  ),
};

export const HoldingsTable: Story = {
  render: () => (
    <Seeded>
      <div className="rounded-xl border border-border bg-card p-4">
        <AssetsTable assets={sampleAssets} />
      </div>
    </Seeded>
  ),
};
