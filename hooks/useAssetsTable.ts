// hooks/useAssetsTable.ts
//
// AssetsTable 组件的核心逻辑 Hook
// 职责：行展开、交易记录缓存、当前价格拉取、删除确认状态管理

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteAsset } from "@/services/assets";
import { deleteTransaction, getTransactions } from "@/services/transactions";
import type { Asset, Transaction } from "@/types/global";

type UseAssetsTableParams = {
  assets: Asset[];
};

export function useAssetsTable({ assets }: UseAssetsTableParams) {
  const router = useRouter();

  // 当前展开的资产 ID（同时只能展开一行）
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // 当前打开"记录交易"Dialog 的资产 ID
  const [transactionOpenId, setTransactionOpenId] = useState<string | null>(null);
  // 以 assetId 为 key 的交易记录缓存，避免重复请求
  const [transactionsMap, setTransactionsMap] = useState<Record<string, Transaction[]>>({});
  // 正在拉取交易记录的资产 ID
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // 待确认删除的资产 ID
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  // 待确认删除的交易记录
  const [deletingTx, setDeletingTx] = useState<{ id: string; assetId: string } | null>(null);
  // 各资产的当前价格缓存
  const [currentPrices, setCurrentPrices] = useState<Record<string, number | null>>({});

  // 组件挂载时批量并行拉取所有资产的当前价格
  useEffect(() => {
    async function fetchAllPrices() {
      const entries = await Promise.all(
        assets.map(async (asset) => {
          try {
            const res = await fetch(`/api/finnhub/quote?symbol=${asset.symbol}`);
            const data = await res.json();
            return [asset.symbol, data.price] as [string, number | null];
          } catch {
            return [asset.symbol, null] as [string, null];
          }
        }),
      );
      setCurrentPrices(Object.fromEntries(entries));
    }

    if (assets.length > 0) fetchAllPrices();
  }, [assets]);

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
