"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAsset, updateAsset } from "@/lib/assets";
import type { Asset, AssetFormData } from "@/types/global";

type Props = {
  // 如果传了 asset，就是编辑模式；没传就是新增模式
  asset?: Asset;
  // 自定义触发按钮（从外部传进来）
  trigger: React.ReactNode;
};

export function AssetForm({ asset, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 表单初始值：编辑时用现有数据，新增时用空字符串
  const [formData, setFormData] = useState<AssetFormData>({
    symbol: asset?.symbol ?? "",
    fullname: asset?.fullname ?? "",
    asset_type: asset?.asset_type ?? "",
  });

  // 当 asset prop 变化时（切换编辑不同行），同步更新表单状态
  useEffect(() => {
    setFormData({
      symbol: asset?.symbol ?? "",
      fullname: asset?.fullname ?? "",
      asset_type: asset?.asset_type ?? "",
    });
  }, [asset]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // 阻止表单默认的页面刷新行为

    // 手动验证 asset_type（Select 组件不支持原生 required）
    if (!formData.asset_type) {
      alert("请选择资产类型");
      return;
    }

    setLoading(true);

    try {
      if (asset) {
        // 编辑模式
        await updateAsset(asset.id, formData);
      } else {
        // 新增模式
        await createAsset(formData);
        // 新增成功后重置表单，避免下次打开时显示旧数据
        setFormData({ symbol: "", fullname: "", asset_type: "" });
      }
      setOpen(false); // 操作成功后关闭弹窗
    } catch (err) {
      console.error(err);
      alert("操作失败，请检查控制台");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{asset ? "编辑资产" : "新增资产"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="symbol">Symbol（代码）</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, symbol: e.target.value }))
              }
              placeholder="例：BTC、NVDA"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="fullname">全名</Label>
            <Input
              id="fullname"
              value={formData.fullname}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullname: e.target.value }))
              }
              placeholder="例：Bitcoin、NVIDIA"
              required
            />
          </div>

          <div className="space-y-1">
            <Label>资产类型</Label>
            <Select
              value={formData.asset_type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, asset_type: value ?? "" }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="etf">ETF</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "处理中..." : asset ? "保存" : "新增"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
