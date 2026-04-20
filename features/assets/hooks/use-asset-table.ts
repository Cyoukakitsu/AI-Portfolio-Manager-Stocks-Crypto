// hooks/use-asset-table.ts
//
// AssetsTable 组件的核心逻辑 Hook
// 职责：行展开、交易记录缓存、当前价格拉取、删除确认状态管理

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteAsset } from "@/features/assets/server/assets";
import { deleteTransaction, getTransactions } from "@/features/assets/server/transactions";
import type { Asset, Transaction } from "@/types/global";

type UseAssetsTableParams = {
  assets: Asset[];
};

export function useAssetsTable({ assets }: UseAssetsTableParams) {
  const router = useRouter();

  // 当前展开的资产 ID（同时只能展开一行）
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // 当前打开"记录交易"Dialog 的资产 ID
  const [transactionOpenId, setTransactionOpenId] = useState<string | null>(
    null,
  );
  // 以 assetId 为 key 的交易记录缓存，避免重复请求
  const [transactionsMap, setTransactionsMap] = useState<
    Record<string, Transaction[]>
  >({});
  // 正在拉取交易记录的资产 ID
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // 待确认删除的资产 ID
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  // 待确认删除的交易记录
  const [deletingTx, setDeletingTx] = useState<{
    id: string;
    assetId: string;
  } | null>(null);
  // 各资产的当前价格，与 use-total-asset-card 使用相同的 queryKey 共享缓存，不重复请求
  const symbolsKey = assets.map((a) => a.symbol).join(",");
  const { data: quotesData = {} } = useQuery<Record<string, { price: number | null }>>({
    queryKey: ["quotes", symbolsKey],
    queryFn: async () => {
      const entries = await Promise.all(
        assets.map(async (asset) => {
          try {
            const res = await fetch(
              `/api/yahoofinance/quote?symbol=${asset.symbol}`,
            );
            const data = await res.json();
            return [asset.symbol, { price: data.price ?? null, prevClose: data.prevClose ?? null }];
          } catch {
            return [asset.symbol, { price: null, prevClose: null }];
          }
        }),
      );
      return Object.fromEntries(entries);
    },
    enabled: assets.length > 0,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
  const currentPrices: Record<string, number | null> = Object.fromEntries(
    Object.entries(quotesData).map(([symbol, q]) => [symbol, q.price]),
  );

  // 展开/收起某一行；首次展开时懒加载交易数据，已缓存的不重复请求
  async function handleExpand(assetId: string) {
    if (expandedId === assetId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(assetId);

    if (transactionsMap[assetId]) return;

    setLoadingId(assetId);
    try {
      const data = await getTransactions(assetId);
      setTransactionsMap((prev) => ({ ...prev, [assetId]: data }));
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoadingId(null);
    }
  }

  // 交易新增成功后：刷新该资产的交易缓存 + 通知 Server Component 更新
  async function handleTransactionSuccess(assetId: string) {
    try {
      const data = await getTransactions(assetId);
      setTransactionsMap((prev) => ({ ...prev, [assetId]: data }));
    } catch {
      toast.error("Failed to add transaction, please try again");
    }
    router.refresh();
  }

  // 确认删除资产
  async function confirmDeleteAsset() {
    if (!deletingAssetId) return;
    try {
      await deleteAsset(deletingAssetId);
      router.refresh();
    } catch {
      toast.error("Failed to delete asset");
    } finally {
      setDeletingAssetId(null);
    }
  }

  // 确认删除交易
  async function confirmDeleteTransaction() {
    if (!deletingTx) return;
    try {
      await deleteTransaction(deletingTx.id);
      const data = await getTransactions(deletingTx.assetId);
      setTransactionsMap((prev) => ({ ...prev, [deletingTx.assetId]: data }));
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete transaction");
    } finally {
      setDeletingTx(null);
    }
  }

  return {
    // 展开行
    expandedId,
    handleExpand,

    // 交易 Dialog
    transactionOpenId,
    setTransactionOpenId,
    handleTransactionSuccess,

    // 交易缓存 & 加载状态
    transactionsMap,
    loadingId,

    // 删除资产
    deletingAssetId,
    setDeletingAssetId,
    confirmDeleteAsset,

    // 删除交易
    deletingTx,
    setDeletingTx,
    confirmDeleteTransaction,

    // 当前价格
    currentPrices,
  };
}
