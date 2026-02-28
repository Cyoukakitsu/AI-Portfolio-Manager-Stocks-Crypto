"use client";

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

import { createAsset, updateAsset } from "@/services/assets";
import { assetSchema, type AssetFormData } from "@/lib/schemas/asset";
import type { Asset } from "@/types/global";
import { SymbolSearch } from "./symbol-search";

type Props = {
  asset?: Asset;
  trigger?: React.ReactNode; // 改为可选，外部控制 open 时不需要传
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
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      symbol: asset?.symbol ?? "",
      fullname: asset?.fullname ?? "",
      asset_type:
        (asset?.asset_type as AssetFormData["asset_type"]) ?? undefined,
    },
  });
  const fullname = useWatch({ control: form.control, name: "fullname" });
  const currentAssetType = useWatch({
    control: form.control,
    name: "asset_type",
  });

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

  async function onSubmit(data: AssetFormData) {
    try {
      if (asset) {
        await updateAsset(asset.id, data);
        toast.success("资产更新成功");
      } else {
        await createAsset(data);
        toast.success("资产添加成功");
      }

      if (!asset) {
        form.reset();
      }
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to add asset, please try again");
    }
  }

  function mapFinnhubType(
    type: string,
  ): AssetFormData["asset_type"] | undefined {
    const map: Record<string, AssetFormData["asset_type"]> = {
      "Common Stock": "stock",
      ETP: "etf",
      Crypto: "crypto",
    };
    return map[type];
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* trigger 可选：有传时渲染触发按钮，外部控制 open 时不需要 */}
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add Asset"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.symbol}>
              <FieldLabel>Symbol</FieldLabel>
              <SymbolSearch
                defaultValue={asset?.symbol ?? ""}
                onSelect={(result) => {
                  // 选中搜索结果时，同时填入三个字段
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
              {form.formState.errors.symbol && (
                <FieldError errors={[form.formState.errors.symbol]} />
              )}
            </Field>

            <Field>
              <FieldLabel>Full Name</FieldLabel>
              <p className="text-sm px-3 py-2 border rounded-md bg-muted/30 text-muted-foreground min-h-9">
                {fullname || "Auto-filled after selection"}
              </p>
            </Field>

            <Field data-invalid={!!form.formState.errors.asset_type}>
              <FieldLabel>Asset Type</FieldLabel>
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
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.asset_type && (
                <FieldError errors={[form.formState.errors.asset_type]} />
              )}
            </Field>

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
