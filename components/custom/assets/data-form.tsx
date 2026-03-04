"use client";

// 资产新增 / 编辑表单（对话框形式）
//
// 设计意图：同一个组件同时承担"新增"和"编辑"两种模式，
// 通过 asset prop 是否存在来区分：有值 = 编辑，无值 = 新增。
// 这样减少了组件数量，保证了两种模式下 UI 的一致性。

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

import { SymbolSearch } from "./symbol-search";

import { createAsset, updateAsset } from "@/services/assets";
import { assetSchema, type AssetFormData } from "@/lib/schemas/asset";
import type { Asset } from "@/types/global";
import { CryptoSearch } from "./crypto-search";

// trigger 可选：支持"由外部 open 状态控制"和"由内置触发按钮控制"两种模式
// 这样 AssetForm 既能作为独立的"＋添加"按钮，也能被 data-table 以受控方式打开
type Props = {
  asset?: Asset;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

export function AssetForm({
  asset,
  trigger,
  open: externalOpen,
  onOpenChange,
  onSuccess,
}: Props) {
  // 双模式 open 状态：外部传了 open/onOpenChange 就用外部控制，否则自己维护
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // react-hook-form + Zod：表单状态管理与校验集成
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      symbol: asset?.symbol ?? "",
      fullname: asset?.fullname ?? "",
      asset_type:
        (asset?.asset_type as AssetFormData["asset_type"]) ?? undefined,
    },
  });

  // useWatch 订阅 fullname 字段的实时值，用于显示预览文本（只读显示区域）
  const fullname = useWatch({ control: form.control, name: "fullname" });
  const currentAssetType = useWatch({
    control: form.control,
    name: "asset_type",
  });

  // 每次对话框打开时重置表单，防止上次编辑的数据残留
  // 依赖 open 而非 asset，是为了支持连续编辑不同资产的场景
  useEffect(() => {
    if (open) {
      form.reset({
        symbol: asset?.symbol ?? "",
        fullname: asset?.fullname ?? "",
        asset_type:
          (asset?.asset_type as AssetFormData["asset_type"]) ?? undefined,
      });
    }
  }, [open, asset, form]);

  useEffect(() => {
    if (currentAssetType === "cash") {
      // 现金：直接自动填入，不需要用户再操作
      form.setValue("symbol", "CASH", { shouldValidate: true });
      form.setValue("fullname", "Cash", { shouldValidate: true });
    } else {
      // 切换到其他类型时清空，让用户重新选择
      form.setValue("symbol", "", { shouldValidate: false });
      form.setValue("fullname", "", { shouldValidate: false });
    }
  }, [currentAssetType, form]);

  async function onSubmit(data: AssetFormData) {
    try {
      if (asset) {
        await updateAsset(asset.id, data);
        toast.success("asset updated successfully");
      } else {
        await createAsset(data);
        toast.success("asset added successfully");
      }

      // 编辑模式下保留表单数据（便于用户查看修改结果），新增模式才重置
      if (!asset) {
        form.reset();
      }
      setOpen(false);
      onSuccess?.(); // 通知父组件刷新列表
    } catch {
      toast.error("Failed to add asset, please try again");
    }
  }

  // 将 Finnhub 返回的 type 字符串映射到项目内部的 asset_type 枚举值
  // Finnhub 的类型命名与项目不一致，需要在这里做翻译层
  function mapFinnhubType(
    type: string,
  ): AssetFormData["asset_type"] | undefined {
    const map: Record<string, AssetFormData["asset_type"]> = {
      "Common Stock": "stock",
      ETP: "etf",
      Crypto: "crypto",
    };
    return map[type]; // 不认识的类型返回 undefined，让用户手动选
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* trigger 存在时才渲染触发按钮；外部受控模式下 trigger 为空，无需渲染 */}
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add Asset"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* 1. asset_type */}
            <Field data-invalid={!!form.formState.errors.asset_type}>
              <FieldLabel>Asset Type</FieldLabel>
              {/* Select 不支持 register()，需要手动 setValue 以接入 react-hook-form */}
              <Select
                value={currentAssetType ?? ""}
                onValueChange={(val) =>
                  form.setValue(
                    "asset_type",
                    val as AssetFormData["asset_type"],
                    {
                      shouldValidate: true,
                    },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset type please" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.asset_type && (
                <FieldError errors={[form.formState.errors.asset_type]} />
              )}
            </Field>

            {/* 2. if not selected type, show symbol field */}
            {!currentAssetType && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Please select an asset type
              </p>
            )}

            {/* 3. symbol : Display different input methods based on asset_type */}
            {currentAssetType && currentAssetType !== "cash" && (
              <Field data-invalid={!!form.formState.errors.symbol}>
                <FieldLabel>Symbol</FieldLabel>

                {/* Stock / ETF：调用 Finnhub 搜索 */}
                {(currentAssetType === "stock" ||
                  currentAssetType === "etf") && (
                  <SymbolSearch
                    defaultValue={asset?.symbol ?? ""}
                    onSelect={(result) => {
                      form.setValue("symbol", result.symbol, {
                        shouldValidate: true,
                      });
                      form.setValue("fullname", result.fullname, {
                        shouldValidate: true,
                      });
                      const mappedType = mapFinnhubType(result.type);
                      if (mappedType) {
                        form.setValue("asset_type", mappedType, {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                )}
                {currentAssetType === "crypto" && (
                  <CryptoSearch
                    defaultValue={asset?.symbol ?? ""}
                    onSelect={(result) => {
                      form.setValue("symbol", result.symbol, {
                        shouldValidate: true,
                      });
                      form.setValue("fullname", result.fullname, {
                        shouldValidate: true,
                      });
                    }}
                  />
                )}

                {form.formState.errors.symbol && (
                  <FieldError errors={[form.formState.errors.symbol]} />
                )}
              </Field>
            )}

            {/* 4. Full Name：只读显示，由搜索结果自动填入，Cash 类型不显示 */}
            {currentAssetType && currentAssetType !== "cash" && (
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <p className="text-sm px-3 py-2 border rounded-md bg-muted/30 text-muted-foreground min-h-9">
                  {fullname || "Auto-filled after selection"}
                </p>
              </Field>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Processing..."
                  : asset
                    ? "Save"
                    : "Add"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
