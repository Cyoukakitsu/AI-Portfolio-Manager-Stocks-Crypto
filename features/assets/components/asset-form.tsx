"use client";

import { useTranslations } from "next-intl";
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
import { useAssetForm } from "@/features/assets/hooks/use-asset-form";

// trigger 可选：支持"由外部 open 状态控制"和"由内置触发按钮控制"两种模式
// 这样 AssetForm 既能作为独立的"＋添加"按钮，也能被 asset-table 以受控方式打开
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
  const t = useTranslations("pages.assets.assetForm");
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
          <DialogTitle>{isEditing ? t("titleEdit") : t("titleAdd")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            {/* 1. asset_type */}
            <Field data-invalid={!!form.formState.errors.asset_type}>
              <FieldLabel>{t("assetType")}</FieldLabel>
              <Select
                value={currentAssetType ?? ""}
                onValueChange={handleAssetTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("assetTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">{t("typeStock")}</SelectItem>
                  <SelectItem value="etf">{t("typeEtf")}</SelectItem>
                  <SelectItem value="crypto">{t("typeCrypto")}</SelectItem>
                  <SelectItem value="cash">{t("typeCash")}</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.asset_type && (
                <FieldError errors={[form.formState.errors.asset_type]} />
              )}
            </Field>

            {!currentAssetType && (
              <p className="text-sm text-muted-foreground text-center py-2">
                {t("selectTypeHint")}
              </p>
            )}

            {currentAssetType && currentAssetType !== "cash" && (
              <Field data-invalid={!!form.formState.errors.symbol}>
                <FieldLabel>{t("symbol")}</FieldLabel>

                <SymbolSearch
                  key={asset?.id ?? "new"}
                  defaultValue={asset?.symbol ?? ""}
                  onSelect={handleSymbolSelect}
                />

                {form.formState.errors.symbol && (
                  <FieldError errors={[form.formState.errors.symbol]} />
                )}
              </Field>
            )}

            {currentAssetType && currentAssetType !== "cash" && (
              <Field>
                <FieldLabel>{t("fullName")}</FieldLabel>
                <p className="text-sm px-3 py-2 border rounded-md bg-muted/30 text-muted-foreground min-h-9">
                  {fullname || t("autoFilled")}
                </p>
              </Field>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? t("processing")
                  : asset
                    ? t("save")
                    : t("add")}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
