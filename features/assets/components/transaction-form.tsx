"use client";

// 交易记录录入表单（买入 / 卖出）
//
// 设计模式：Controller 受控模式 + useWatch 实时联动
// 使用 Controller 而非 register()，是因为 Tabs、Calendar 等第三方组件
// 无法直接接受 React 的 ref，必须通过 Controller 的 field.onChange 桥接

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
      toast.success("Transaction added");
      form.reset();
      onOpenChange(false);
      onSuccess?.(); // 触发父组件重新拉取交易列表
    } catch {
      toast.error("Failed to add transaction, please try again");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {/* 标题根据当前选中的 Buy/Sell 动态变化，提升用户感知 */}
          <DialogTitle>
            {currentType === "buy"
              ? "Record Buy Transaction"
              : "Record Sell Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Buy / Sell 切换：用 Tabs 而非 radio，视觉上更清晰 */}
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Tabs
                  value={field.value}
                  onValueChange={(val) =>
                    // onValueChange 回调的参数类型是 string，
                    // 断言回联合类型 "buy" | "sell" 以满足 Zod schema 的要求
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

            <div className="grid grid-cols-3 gap-4">
              {/* Quantity：自定义加减按钮 + 原生 number input */}
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="min-w-0">
                    <FieldLabel>Quantity</FieldLabel>
                    <div className="flex items-center border rounded-md h-8">
                      <button
                        type="button"
                        className="px-3 h-full hover:bg-muted"
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
                        className="px-3 h-full hover:bg-muted"
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

              {/* 交易日期：日历选择器，限制不能选未来日期 */}
              <Controller
                name="traded_at"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="min-w-0">
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
                            <CalendarIcon className="w-4 h-4" />
                            {field.value ? field.value : "Select date"}
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

              {/* 交易价格：step="0.01" 支持小数输入 */}
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="min-w-0">
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
