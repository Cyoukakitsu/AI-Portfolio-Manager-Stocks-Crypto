"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
            <Controller
              name="symbol"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="symbol">Symbol</FieldLabel>
                  <Input
                    {...field}
                    id="symbol"
                    placeholder="e.g. BTC, NVDA"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="fullname"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="fullname">Full Name</FieldLabel>
                  <Input
                    {...field}
                    id="fullname"
                    placeholder="e.g. Bitcoin, NVIDIA"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="asset_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Asset Type</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="etf">ETF</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
