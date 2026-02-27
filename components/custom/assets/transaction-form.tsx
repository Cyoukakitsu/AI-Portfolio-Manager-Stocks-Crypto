"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { createTransaction } from "@/services/transactions";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/lib/schemas/transaction";

type Props = {
  assetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function TransactionForm({
  assetId,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      asset_id: assetId,
      type: "buy",
      quantity: 1,
      price: 0,
      traded_at: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const currentType = useWatch({ control: form.control, name: "type" });

  async function onSubmit(data: TransactionFormData) {
    try {
      await createTransaction(data);
      toast.success("Transaction added");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to add transaction, please try again");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentType === "buy"
              ? "Record Buy Transaction"
              : "Record Sell Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Buy / Sell 切换 Tab  */}
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Tabs
                  value={field.value}
                  onValueChange={(val) =>
                    // Tabs 的 onValueChange 返回 string，断言回联合类型
                    field.onChange(val as "buy" | "sell")
                  }
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="buy" className="flex-1">
                      Buy
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="flex-1">
                      Sell
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            />

            <div className="flex gap-4">
              {/* Quantity：加减按钮 + 隐藏原生箭头的数字输入框 */}
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="flex-1">
                    <FieldLabel>Quantity</FieldLabel>
                    <div className="flex items-center border rounded-md">
                      <button
                        type="button"
                        className="px-3 py-2 hover:bg-muted"
                        onClick={() =>
                          field.onChange(Math.max(1, Number(field.value) - 1))
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        /*
                         * 修复1：隐藏 input[type=number] 原生的上下箭头
                         * - [appearance-none] 是 Tailwind 的写法，等同于 -webkit-appearance: none
                         * - 针对 Firefox 需要额外加 [&::-moz-appearance:textfield]，
                         *   但 Tailwind 没有内建，所以用 style 补上
                         */
                        className="w-full text-center bg-transparent outline-none py-2 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        value={field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          // 修复2：允许清空过程中的空字符串，不强制转回 1
                          // Zod 会在 submit 时验证是否合法
                          field.onChange(val === "" ? "" : parseFloat(val));
                        }}
                      />
                      <button
                        type="button"
                        className="px-3 py-2 hover:bg-muted"
                        onClick={() => field.onChange(Number(field.value) + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* 购买日期 */}
              <Controller
                name="traded_at"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="flex-1">
                    <FieldLabel>
                      {currentType === "buy" ? "Purchase Date" : "Sell Date"}
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <CalendarIcon className="mr-2 w-4 h-4" />
                            {field.value ? field.value : "Select date"}
                          </Button>
                        }
                      />
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          /*
                           * 修复3：日期时区偏移问题
                           * new Date("2025-01-15") 会被解析为 UTC 00:00，
                           * 在 UTC+9 的日本时区显示时会变成前一天（1月14日）
                           * 加上 T00:00:00 强制按本地时区解析
                           */
                          selected={
                            field.value
                              ? new Date(field.value + "T00:00:00")
                              : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(
                              date ? format(date, "yyyy-MM-dd") : "",
                            )
                          }
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* 购买价格 */}
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="flex-1">
                    <FieldLabel>
                      {currentType === "buy" ? "Purchase Price" : "Sell Price"}
                    </FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? "" : parseFloat(val));
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
