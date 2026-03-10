"use client";

// 资产新增 / 编辑表单（对话框形式）
//
// 设计意图：同一个组件同时承担"新增"和"编辑"两种模式，
// 通过 asset prop 是否存在来区分：有值 = 编辑，无值 = 新增。
// 这样减少了组件数量，保证了两种模式下 UI 的一致性。

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
import type { Asset } from "@/types/global";
import { useAssetForm } from "@/hooks/useAssetForm";
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
  const {
    open,
    setOpen,
    form,
    fullname,
    currentAssetType,
    onSubmit,
    handleSymbolSelect,
    handleAssetTypeChange,
    isEditing,
  } = useAssetForm({ asset, open: externalOpen, onOpenChange, onSuccess });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* trigger 存在时才渲染触发按钮；外部受控模式下 trigger 为空，无需渲染 */}
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Asset" : "Add Asset"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            {/* 1. asset_type */}
            <Field data-invalid={!!form.formState.errors.asset_type}>
              <FieldLabel>Asset Type</FieldLabel>
              {/* Select 不支持 register()，需要手动 setValue 以接入 react-hook-form */}
              <Select
                value={currentAssetType ?? ""}
                onValueChange={handleAssetTypeChange}
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
                    onSelect={handleSymbolSelect}
                  />
                )}
                {currentAssetType === "crypto" && (
                  <CryptoSearch
                    defaultValue={asset?.symbol ?? ""}
                    onSelect={handleSymbolSelect}
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
