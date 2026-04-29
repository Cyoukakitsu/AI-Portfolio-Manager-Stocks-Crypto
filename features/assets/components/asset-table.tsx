"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
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
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { TransactionForm } from "@/features/assets/components/transaction-form";
import type { Asset } from "@/types/global";
import { useAssetsTable } from "@/features/assets/hooks/use-asset-table";
import { motion, AnimatePresence } from "motion/react";

const MotionTableRow = motion.create(TableRow);

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
  const t = useTranslations("pages.assets");
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
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.symbol")}</TableHead>
              <TableHead>{t("table.fullName")}</TableHead>
              <TableHead>{t("table.type")}</TableHead>
              <TableHead>{t("table.holdingQty")}</TableHead>
              <TableHead>{t("table.holdingPrice")}</TableHead>
              <TableHead>{t("table.marketPrice")}</TableHead>
              <TableHead>{t("table.returnPct")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              // 空状态：无资产时显示占位提示
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {t("noData")}
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset, index) => (
                // Fragment 作为容器，让主行和展开行共享同一个 key，
                // 避免在 Table 中插入非 <tr> 的包裹元素（违反 HTML 规范）
                <Fragment key={asset.id}>
                  {/* 主行 — stagger 进场 */}
                  <MotionTableRow
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut" as const,
                      delay: index * 0.04,
                    }}
                  >
                    <TableCell className="font-medium">
                      {asset.symbol}
                    </TableCell>
                    <TableCell>{asset.fullname}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(asset.asset_type)}>
                        {asset.asset_type}
                      </Badge>
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
                        ? (() => {
                            const p = Number(currentPrices[asset.symbol]);
                            return !isNaN(p) &&
                              currentPrices[asset.symbol] != null
                              ? `$${p.toFixed(2)}`
                              : "—";
                          })()
                        : t("loading")}
                    </TableCell>
                    {/* 收益率：(市场价格 - 均价) / 均价 * 100，正值绿色，负值红色 */}
                    <TableCell>
                      {(() => {
                        const price = Number(currentPrices[asset.symbol]);
                        if (
                          currentPrices[asset.symbol] == null ||
                          isNaN(price) ||
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
                        <motion.div
                          animate={{
                            rotate: expandedId === asset.id ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </Button>
                    </TableCell>
                  </MotionTableRow>

                  {/* 展开行 — AnimatePresence 控制进出场 */}
                  <AnimatePresence>
                    {expandedId === asset.id && (
                      <TableRow key={`${asset.id}-expanded`}>
                        <TableCell colSpan={7} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.25,
                              ease: "easeInOut" as const,
                            }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="bg-muted/30 p-4">
                              {loadingId === asset.id ? (
                                // 交易记录加载中
                                <p className="text-sm text-muted-foreground">
                                  {t("loading")}
                                </p>
                              ) : transactionsMap[asset.id]?.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  {t("table.noTransactions")}
                                </p>
                              ) : (
                                // 交易记录列表
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>{t("table.date")}</TableHead>
                                      <TableHead>{t("table.price")}</TableHead>
                                      <TableHead>{t("table.quantity")}</TableHead>
                                      <TableHead>{t("table.type")}</TableHead>
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
                                            {tx.type === "buy" ? t("table.buy") : t("table.sell")}
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
                                className="mt-3 text-sm text-primary flex items-center gap-1 hover:underline cursor-pointer"
                                onClick={() => setTransactionOpenId(asset.id)}
                              >
                                <Plus className="w-3 h-3" />
                                {t("table.recordTransaction")}
                              </button>
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
            <AlertDialogTitle>{t("table.deleteAsset")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("table.deleteAssetDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default">
              {t("table.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteAsset}
            >
              {t("table.delete")}
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
            <AlertDialogTitle>{t("table.deleteTransaction")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("table.deleteTransactionDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default">
              {t("table.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteTransaction}
            >
              {t("table.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
