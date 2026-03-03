"use client";

// 资产列表表格组件
//
// 核心交互：
//   - 每行可展开，展开后显示该资产的历史交易记录（懒加载）
//   - 通过 DropdownMenu 提供编辑、记录交易、删除三个操作
//
// 状态管理策略：
//   - transactionsMap 作为本地缓存，避免每次展开都重新请求
//   - 删除/新增交易后主动清除缓存并重新拉取，保证数据准确
//   - router.refresh() 通知 Next.js 重新渲染 Server Component（如资产总览统计）

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react";
import { AssetForm } from "@/components/custom/assets/data-form";
import { TransactionForm } from "@/components/custom/assets/transaction-form";
import { deleteAsset } from "@/services/assets";
import { deleteTransaction, getTransactions } from "@/services/transactions";
import type { Asset, Transaction } from "@/types/global";
import { toast } from "sonner";

type Props = {
  assets: Asset[];
};

export function AssetsTable({ assets }: Props) {
  const router = useRouter();

  // expandedId：当前展开的资产 ID（同时只能展开一行）
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // transactionOpenId：当前打开"记录交易"Dialog 的资产 ID
  const [transactionOpenId, setTransactionOpenId] = useState<string | null>(
    null,
  );
  // editingId：当前打开"编辑资产"Dialog 的资产 ID
  const [editingId, setEditingId] = useState<string | null>(null);
  // transactionsMap：以 assetId 为 key 的交易记录缓存，避免重复请求
  const [transactionsMap, setTransactionsMap] = useState<
    Record<string, Transaction[]>
  >({});
  // loadingId：正在拉取交易记录的资产 ID（用于显示 Loading 状态）
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // deletingAssetId：待确认删除的资产 ID，不为 null 时弹出确认对话框
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  // deletingTx：待确认删除的交易记录，不为 null 时弹出确认对话框
  const [deletingTx, setDeletingTx] = useState<{
    id: string;
    assetId: string;
  } | null>(null);

  // 展开/收起某一行：点同一行为收起，点另一行为切换展开
  // 懒加载：只在首次展开时才请求交易数据，已缓存的不重复请求
  async function handleExpand(assetId: string) {
    if (expandedId === assetId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(assetId);

    // 命中缓存则跳过请求
    if (transactionsMap[assetId]) return;

    setLoadingId(assetId);
    try {
      const data = await getTransactions(assetId);
      // 用函数式更新合并进现有缓存，而不是覆盖整个 map
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
    // router.refresh() 让 Next.js 重新请求 Server Component 数据，
    // 更新资产列表中显示的 avg_price 和 total_cost
    router.refresh();
  }

  // 确认删除资产：由 AlertDialog 的 Action 按钮触发
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

  // 确认删除交易：由 AlertDialog 的 Action 按钮触发
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

  function handleEditSuccess() {
    // 编辑资产（symbol/name/type）只影响 Server Component 部分，触发整页刷新即可
    router.refresh();
  }

  // 根据资产类型返回 Badge 的视觉样式，使不同类型在视觉上可区分
  function getBadgeVariant(type: string) {
    const map: Record<string, "default" | "secondary" | "outline"> = {
      crypto: "default",
      stock: "secondary",
      etf: "outline",
    };
    return map[type] ?? "outline"; // 未知类型降级为 outline
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Avg Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No data
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => (
              // Fragment 作为容器，让主行和展开行共享同一个 key，
              // 避免在 Table 中插入非 <tr> 的包裹元素（违反 HTML 规范）
              <Fragment key={asset.id}>
                {/* 主行 */}
                <TableRow>
                  <TableCell className="font-medium">{asset.symbol}</TableCell>
                  <TableCell>{asset.fullname}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(asset.asset_type)}>
                      {asset.asset_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(asset.created_at).toLocaleDateString("en-US")}
                  </TableCell>
                  <TableCell>
                    {/* avg_price 为 null 说明还没有买入记录，显示破折号 */}
                    {asset.avg_price != null
                      ? `$${asset.avg_price.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {/* ⋮ 操作菜单 */}
                    <DropdownMenu>
                      {/*
                        用 buttonVariants() 而非 <Button> 包裹 DropdownMenuTrigger：
                        DropdownMenuTrigger 本身渲染 <button>，若再嵌套 <Button>（也是 <button>），
                        会产生 <button> 内嵌 <button> 的非法 HTML，浏览器行为不可预测。
                        buttonVariants() 只借 CSS 类名，不产生额外 DOM 元素。
                      */}
                      <DropdownMenuTrigger
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon",
                        })}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingId(asset.id)}
                        >
                          Edit Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setTransactionOpenId(asset.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Record Transaction
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletingAssetId(asset.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Asset
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 展开/收起按钮：图标根据当前状态动态切换 */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExpand(asset.id)}
                    >
                      {expandedId === asset.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>

                {/* 展开行：显示该资产的交易历史，跨满所有列 */}
                {expandedId === asset.id && (
                  <TableRow key={`${asset.id}-expanded`}>
                    <TableCell colSpan={6} className="bg-muted/30 p-4">
                      {loadingId === asset.id ? (
                        <p className="text-sm text-muted-foreground">
                          Loading...
                        </p>
                      ) : transactionsMap[asset.id]?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No transactions yet
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactionsMap[asset.id]?.map((tx) => (
                              <TableRow key={tx.id}>
                                <TableCell>{tx.traded_at}</TableCell>
                                <TableCell>${tx.price}</TableCell>
                                <TableCell>{tx.quantity}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      tx.type === "buy"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {tx.type === "buy" ? "Buy" : "Sell"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                      setDeletingTx({
                                        id: tx.id,
                                        assetId: asset.id,
                                      })
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}

                      <button
                        className="mt-3 text-sm text-primary flex items-center gap-1 hover:underline"
                        onClick={() => setTransactionOpenId(asset.id)}
                      >
                        <Plus className="w-3 h-3" />
                        Record another buy transaction
                      </button>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          )}
        </TableBody>
      </Table>

      {/*
        Dialog 渲染在 Table 外部，而非 TableRow 内部。
        原因：Dialog 通常使用 Portal 渲染到 body，如果放在 <tr> 内会产生非法的 HTML 嵌套，
        某些浏览器会将其自动移出，导致样式或交互异常。
      */}
      {assets.map((asset) => (
        <Fragment key={asset.id}>
          {/* 编辑资产 Dialog：只有 editingId 匹配时才打开，避免同时渲染多个 Dialog */}
          <AssetForm
            key={`edit-${asset.id}`}
            asset={asset}
            open={editingId === asset.id}
            onOpenChange={(isOpen) => {
              if (!isOpen) setEditingId(null);
            }}
            onSuccess={handleEditSuccess}
          />

          {/* 新增交易 Dialog */}
          <TransactionForm
            key={`tx-${asset.id}`}
            assetId={asset.id}
            open={transactionOpenId === asset.id}
            onOpenChange={(isOpen) => {
              if (!isOpen) setTransactionOpenId(null);
            }}
            onSuccess={() => handleTransactionSuccess(asset.id)}
          />
        </Fragment>
      ))}

      {/* 删除资产确认对话框 */}
      <AlertDialog
        open={deletingAssetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingAssetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the asset and all its transaction
              history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteAsset}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除交易确认对话框 */}
      <AlertDialog
        open={deletingTx !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTx(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction record. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteTransaction}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
