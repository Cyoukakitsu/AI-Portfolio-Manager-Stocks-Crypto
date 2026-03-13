// hooks/useAssetForm.ts
//
// AssetForm 组件的核心逻辑 Hook
// 职责：表单状态管理、Dialog 开关控制、提交处理、asset_type 联动
// 组件侧只负责 UI 渲染，不再包含业务逻辑

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createAsset, updateAsset } from "@/services/assets";
import { assetSchema, type AssetFormData } from "@/lib/schemas/asset";
import type { Asset } from "@/types/global";

// ---------- 类型定义 ----------

type UseAssetFormParams = {
  asset?: Asset; // 有值 = 编辑模式，无值 = 新增模式
  open?: boolean; // 外部受控的 open 状态
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void; // 提交成功后的回调（通常是刷新列表）
};

// ---------- 工具函数 ----------

function mapYahooType(type: string): AssetFormData["asset_type"] | undefined {
  const map: Record<string, AssetFormData["asset_type"]> = {
    EQUITY: "stock", // 股票
    ETF: "etf", // ETF
    CRYPTOCURRENCY: "crypto", // 加密货币
  };
  return map[type]; // 未识别的类型返回 undefined，交给用户手动选择
}

// 根据 asset prop 生成表单默认值
// 抽成函数是因为 reset() 和 useForm() 都需要用到同样的逻辑
function getDefaultValues(asset?: Asset): AssetFormData {
  return {
    symbol: asset?.symbol ?? "",
    fullname: asset?.fullname ?? "",
    asset_type: (asset?.asset_type as AssetFormData["asset_type"]) ?? undefined,
  };
}

// ---------- Hook 本体 ----------

export function useAssetForm({
  asset,
  open: externalOpen,
  onOpenChange,
  onSuccess,
}: UseAssetFormParams) {
  // ---- 1. Dialog 开关：支持"外部受控"和"内部自管理"两种模式 ----
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // ---- 2. react-hook-form 初始化 ----
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: getDefaultValues(asset),
  });

  // 订阅表单字段的实时值，供组件渲染时使用
  const fullname = useWatch({ control: form.control, name: "fullname" });
  const currentAssetType = useWatch({
    control: form.control,
    name: "asset_type",
  });

  // ---- 3. 每次 Dialog 打开时重置表单 ----
  // 依赖 open 而非 asset，确保"连续编辑不同资产"时数据不会残留
  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(asset));
    }
  }, [open, asset, form]);

  // ---- 4. asset_type 切换时的联动逻辑 ----
  // cash 类型：自动填充 symbol/fullname
  // 其他类型：清空旧值，让用户重新搜索选择
  useEffect(() => {
    if (currentAssetType === "cash") {
      form.setValue("symbol", "CASH", { shouldValidate: true });
      form.setValue("fullname", "Cash", { shouldValidate: true });
    } else {
      form.setValue("symbol", "", { shouldValidate: false });
      form.setValue("fullname", "", { shouldValidate: false });
    }
  }, [currentAssetType, form]);

  // ---- 5. 表单提交处理 ----
  async function onSubmit(data: AssetFormData) {
    try {
      if (asset) {
        await updateAsset(asset.id, data);
        toast.success("Asset updated successfully");
      } else {
        await createAsset(data);
        toast.success("Asset added successfully");
      }

      // 新增模式重置表单，编辑模式保留数据（方便用户确认修改结果）
      if (!asset) {
        form.reset();
      }
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to save asset, please try again");
    }
  }

  // ---- 6. 搜索结果选中的处理函数 ----
  // 被 SymbolSearch / CryptoSearch 的 onSelect 调用
  function handleSymbolSelect(result: {
    symbol: string;
    fullname: string;
    type?: string;
  }) {
    form.setValue("symbol", result.symbol, { shouldValidate: true });
    form.setValue("fullname", result.fullname, { shouldValidate: true });

    // Finnhub 搜索结果带 type 字段时，自动映射到 asset_type
    if (result.type) {
      const mappedType = mapYahooType(result.type);
      if (mappedType) {
        form.setValue("asset_type", mappedType, { shouldValidate: true });
      }
    }
  }

  // ---- 7. asset_type Select 变更处理 ----
  function handleAssetTypeChange(value: AssetFormData["asset_type"] | null) {
    if (!value) return;
    form.setValue("asset_type", value, {
      shouldValidate: true,
    });
  }

  // ---- 返回组件需要的一切 ----
  return {
    // Dialog 控制
    open,
    setOpen,

    // 表单实例（组件需要访问 errors、isSubmitting 等）
    form,

    // 监听到的实时字段值
    fullname,
    currentAssetType,

    // 事件处理函数
    onSubmit: form.handleSubmit(onSubmit),
    handleSymbolSelect,
    handleAssetTypeChange,

    // 状态标记
    isEditing: !!asset,
  };
}
