"use client";

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
import { Button, buttonVariants } from "@/components/ui/button"; // 新增导入 buttonVariants
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const router = useRouter(); // 用于删除/编辑后刷新数据

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [transactionOpenId, setTransactionOpenId] = useState<string | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transactionsMap, setTransactionsMap] = useState<
    Record<string, Transaction[]>
  >({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
    } finally {
      setLoadingId(null);
    }
  }

  async function handleTransactionSuccess(assetId: string) {
    // 清除缓存，下次展开时重新拉取
    try {
      const data = await getTransactions(assetId);
      setTransactionsMap((prev) => ({ ...prev, [assetId]: data }));
    } catch {
      toast.error("Failed to add transaction, please try again");
    }
    // 刷新 Server Component 数据（例如总资产统计等）
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      await deleteAsset(id);
      router.refresh(); // 删除后刷新列表
    } catch {}
  }

  async function handleDeleteTransaction(
    transactionId: string,
    assetId: string,
  ) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteTransaction(transactionId);
      const data = await getTransactions(assetId);
      setTransactionsMap((prev) => ({ ...prev, [assetId]: data }));
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete transaction");
    }
  }

  // 编辑成功后的回调
  function handleEditSuccess() {
    router.refresh();
  }

  function getBadgeVariant(type: string) {
    const map: Record<string, "default" | "secondary" | "outline"> = {
      crypto: "default",
      stock: "secondary",
      etf: "outline",
    };
    return map[type] ?? "outline";
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
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No data
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => (
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
                    {asset.avg_price != null
                      ? `$${asset.avg_price.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {/* ⋮ 菜单 */}
                    <DropdownMenu>
                      {/*
                        修复点：移除内层的 <Button>
                        DropdownMenuTrigger 本身会渲染 <button>，
                        再套 <Button> 会造成 <button> 嵌套 <button>，
                        用 buttonVariants() 只借样式类名，不产生额外元素
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
                          onClick={() => handleDelete(asset.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Asset
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 展开/收起按钮 */}
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

                {/* 展开行：交易记录 */}
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
                                      handleDeleteTransaction(tx.id, asset.id)
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

      {/* Dialog 放在 Table 外面，避免 DOM 嵌套问题 */}
      {assets.map((asset) => (
        <Fragment key={asset.id}>
          {/* 编辑资产 Dialog */}
          <AssetForm
            key={`edit-${asset.id}`}
            asset={asset}
            open={editingId === asset.id}
            onOpenChange={(isOpen) => {
              if (!isOpen) setEditingId(null);
            }}
            onSuccess={handleEditSuccess} // 编辑成功后刷新
          />

          {/* 买入交易 Dialog */}
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
    </>
  );
}
