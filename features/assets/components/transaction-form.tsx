"use client";

import { useTranslations } from "next-intl";
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

import { createTransaction } from "@/features/assets/server/transactions";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/features/assets/schemas/transaction";

type Props = {
  assetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // 提交成功后通知父组件刷新
};

export function TransactionForm({
  assetId,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const t = useTranslations("pages.assets.transactionForm");
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      asset_id: assetId, // 直接绑定，用户不可见不可修改
      type: "buy", // 默认买入
      quantity: 1,
      price: 0,
      traded_at: "", //用户主动选择
    },
  });

  // useWatch 监听 type 字段，用于动态改变标题和标签文字（Buy/Sell）
  const currentType = useWatch({ control: form.control, name: "type" });

  async function onSubmit(data: TransactionFormData) {
    try {
      await createTransaction(data);
      toast.success(t("toastSuccess"));
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error(t("toastError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentType === "buy" ? t("titleBuy") : t("titleSell")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Tabs
                  value={field.value}
                  onValueChange={(val) => field.onChange(val as "buy" | "sell")}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="buy" className="flex-1">
                      {t("buy")}
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="flex-1">
                      {t("sell")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="min-w-0">
                    <FieldLabel>{t("quantity")}</FieldLabel>
                    <div className="flex items-center border rounded-md h-8">
                      <button
                        type="button"
                        className="px-3 h-full hover:bg-muted cursor-pointer"
                        // Math.max(1, ...) 防止数量减到 0 或负数
                        onClick={() =>
                          field.onChange(Math.max(1, Number(field.value) - 1))
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        /*
                         * 用 Tailwind 类名隐藏 input[type=number] 自带的上下箭头：
                         * - [appearance-none] 处理 WebKit 浏览器（Chrome/Safari）
                         * - [&::-webkit-inner-spin-button]:appearance-none 精准隐藏内部箭头
                         * - Firefox 需要额外用 CSS 变量处理（此处用 style 属性补充）
                         */
                        className="w-full text-center bg-transparent outline-none py-2 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        value={field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          // 允许用户清空输入框（空字符串），不强制转为 1；
                          // 提交时 Zod 会校验数量是否合法，避免在输入过程中打断用户
                          field.onChange(val === "" ? "" : parseFloat(val));
                        }}
                      />
                      <button
                        type="button"
                        className="px-3 h-full hover:bg-muted cursor-pointer"
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

              <Controller
                name="traded_at"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="min-w-0">
                    <FieldLabel>
                      {currentType === "buy"
                        ? t("purchaseDate")
                        : t("sellDate")}
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <CalendarIcon className="w-4 h-4" />
                            {field.value ? field.value : t("selectDate")}
                          </Button>
                        }
                      />
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          /*
                           * 日期时区修复：
                           * new Date("2025-01-15") 会被 JS 解析为 UTC 00:00，
                           * 在 UTC+9（日本）等东区时区下会显示为前一天（1月14日）。
                           * 加上 "T00:00:00" 强制按本地时区解析，解决跨时区显示错误。
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
                          // 禁用未来日期：交易只能记录已发生的，不能预约
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

              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="min-w-0">
                    <FieldLabel>
                      {currentType === "buy"
                        ? t("purchasePrice")
                        : t("sellPrice")}
                    </FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        // 同 quantity：允许清空过程中的空字符串，提交时再由 Zod 校验
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
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t("saving") : t("save")}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
