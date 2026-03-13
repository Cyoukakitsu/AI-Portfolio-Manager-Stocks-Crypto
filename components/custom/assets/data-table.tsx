"use client";

// 资产列表表格组件
//
// 核心交互：
//   - 每行可展开，展开后显示该资产的历史交易记录（懒加载）
//   - 每行右侧提供直接删除按钮和展开/收起按钮
//
// 状态管理策略见 hooks/useAssetsTable.ts

import { Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { TransactionForm } from "@/components/custom/assets/transaction-form";
import type { Asset } from "@/types/global";
import { useAssetsTable } from "@/hooks/assetsHooks/useAssetsTable";

type Props = {
  assets: Asset[];
};

// 根据资产类型返回对应的 Badge 样式
function getBadgeVariant(type: string): "default" | "secondary" | "outline" {
  const map: Record<string, "default" | "secondary" | "outline"> = {
    crypto: "default",
    stock: "secondary",
    etf: "outline",
  };
  return map[type] ?? "outline";
}

export function AssetsTable({ assets }: Props) {
  const {
    expandedId,
    handleExpand,
    transactionOpenId,
    setTransactionOpenId,
    handleTransactionSuccess,
    transactionsMap,
    loadingId,
    deletingAssetId,
    setDeletingAssetId,
    confirmDeleteAsset,
    deletingTx,
    setDeletingTx,
    confirmDeleteTransaction,
    currentPrices, // 各资产实时价格，key 为 symbol
  } = useAssetsTable({ assets });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Holding Quantity</TableHead>
            <TableHead>Holding Price</TableHead>
            <TableHead>Market Price</TableHead>
            <TableHead>return %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            // 空状态：无资产时显示占位提示
            <TableRow>
              <TableCell
                colSpan={8}
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
                  {/* 持仓数量：无持仓时显示 — */}
                  <TableCell>
                    {asset.total_quantity > 0 ? asset.total_quantity : "—"}
                  </TableCell>
                  {/* 平均持仓价格 */}
                  <TableCell>
                    {asset.avg_price != null
                      ? `$${asset.avg_price.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  {/* 实时市场价格：未加载完成时显示 Loading... */}
                  <TableCell>
                    {asset.symbol in currentPrices
                      ? currentPrices[asset.symbol] != null
                        ? `$${currentPrices[asset.symbol]!.toFixed(2)}`
                        : "—"
                      : "Loading..."}
                  </TableCell>
                  {/* 收益率：(市场价格 - 均价) / 均价 * 100，正值绿色，负值红色 */}
                  <TableCell>
                    {(() => {
                      const price = currentPrices[asset.symbol];
                      if (
                        price === null ||
                        asset.avg_price === null ||
                        asset.avg_price === 0
                      )
                        return "—";
                      const assetReturn =
                        ((price - asset.avg_price) / asset.avg_price) * 100;
                      return (
                        <span
                          className={
                            assetReturn >= 0
                              ? "text-green-500 dark:text-green-400"
                              : "text-red-500 dark:text-red-400"
                          }
                        >
                          {assetReturn >= 0 ? "+" : ""}
                          {assetReturn.toFixed(2)}%
                        </span>
                      );
                    })()}
                  </TableCell>
                  {/* 操作列：删除资产 + 展开/收起交易记录 */}
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeletingAssetId(asset.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

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
                    <TableCell colSpan={8} className="bg-muted/30 p-4">
                      {loadingId === asset.id ? (
                        // 交易记录加载中
                        <p className="text-sm text-muted-foreground">
                          Loading...
                        </p>
                      ) : transactionsMap[asset.id]?.length === 0 ? (
                        // 暂无交易记录
                        <p className="text-sm text-muted-foreground">
                          No transactions yet
                        </p>
                      ) : (
                        // 交易记录列表
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

                      {/* 新增交易按钮，点击后打开 TransactionForm Dialog */}
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
        原因：Dialog 通常使用 Portal 渲染到 body，如果放在 <tr> 内会产生非法的 HTML 嵌套。
      */}
      {assets.map((asset) => (
        <TransactionForm
          key={`tx-${asset.id}`}
          assetId={asset.id}
          open={transactionOpenId === asset.id}
          onOpenChange={(isOpen) => {
            if (!isOpen) setTransactionOpenId(null);
          }}
          onSuccess={() => handleTransactionSuccess(asset.id)}
        />
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
            <AlertDialogCancel variant="outline" size="default">
              Cancel
            </AlertDialogCancel>
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
            <AlertDialogCancel variant="outline" size="default">
              Cancel
            </AlertDialogCancel>
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
