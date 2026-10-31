"use client";

// 持仓列表表格，含展开行查看交易记录
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
import type { Asset, Transaction } from "@/features/assets/types";
import { useAssetsTable } from "@/features/assets/hooks/use-assets-table";
import { motion, AnimatePresence } from "motion/react";

const MotionTableRow = motion.create(TableRow);

type Props = {
  assets: Asset[];
};

// 资产类型对应的 Badge 样式；Record 的 key 类型会强制覆盖所有资产类型
const BADGE_VARIANT_BY_ASSET_TYPE: Record<
  Asset["asset_type"],
  "default" | "secondary" | "outline"
> = {
  crypto: "default",
  stock: "secondary",
  etf: "outline",
  cash: "outline",
};

function formatPrice(price: number | null): string {
  return price === null ? "—" : `$${price.toFixed(2)}`;
}

// 收益率（%）；没有市场价或均价为 0/空时无法计算，返回 null
function calcReturnPct(
  marketPrice: number | null | undefined,
  avgPrice: number | null,
): number | null {
  if (marketPrice == null || !avgPrice) return null;
  return ((marketPrice - avgPrice) / avgPrice) * 100;
}

function ReturnPct({ value }: { value: number | null }) {
  if (value === null) return "—";
  return (
    <span
      className={
        value >= 0
          ? "text-green-500 dark:text-green-400"
          : "text-red-500 dark:text-red-400"
      }
    >
      {value >= 0 ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

function TransactionList({
  transactions,
  loading,
  onDelete,
}: {
  transactions: Transaction[] | undefined;
  loading: boolean;
  onDelete: (transactionId: string) => void;
}) {
  const t = useTranslations("pages.assets");

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }
  // undefined 表示加载失败（hook 里已 toast 提示），和空列表显示同样的占位
  if (!transactions?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("table.noTransactions")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="table-fixed w-full">
        <colgroup>
          <col className="w-32" />
          <col className="w-28" />
          <col className="w-24" />
          <col className="w-20" />
          <col className="w-10" />
        </colgroup>
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
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="text-sm">{tx.traded_at}</TableCell>
              <TableCell className="text-sm">${tx.price}</TableCell>
              <TableCell className="text-sm">{tx.quantity}</TableCell>
              <TableCell>
                <Badge variant={tx.type === "buy" ? "default" : "secondary"}>
                  {tx.type === "buy" ? t("table.buy") : t("table.sell")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(tx.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type AssetRowProps = {
  asset: Asset;
  index: number;
  // undefined 表示行情还在加载，null 表示无报价
  marketPrice: number | null | undefined;
  expanded: boolean;
  loadingTransactions: boolean;
  transactions: Transaction[] | undefined;
  onToggleExpand: () => void;
  onDeleteAsset: () => void;
  onDeleteTransaction: (transactionId: string) => void;
  onRecordTransaction: () => void;
};

// 主行 + 展开行
function AssetRow({
  asset,
  index,
  marketPrice,
  expanded,
  loadingTransactions,
  transactions,
  onToggleExpand,
  onDeleteAsset,
  onDeleteTransaction,
  onRecordTransaction,
}: AssetRowProps) {
  const t = useTranslations("pages.assets");

  return (
    // Fragment 作为容器，让主行和展开行同属一个组件，
    // 避免在 Table 中插入非 <tr> 的包裹元素（违反 HTML 规范）
    <Fragment>
      {/* 主行 — stagger 进场 */}
      <MotionTableRow
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeOut" as const,
          delay: index * 0.04,
        }}
        className="cursor-pointer"
        onClick={onToggleExpand}
      >
        <TableCell className="font-medium">{asset.symbol}</TableCell>
        <TableCell>{asset.fullname}</TableCell>
        <TableCell>
          <Badge variant={BADGE_VARIANT_BY_ASSET_TYPE[asset.asset_type]}>
            {asset.asset_type}
          </Badge>
        </TableCell>
        {/* 持仓数量：无持仓时显示 — */}
        <TableCell>
          {asset.total_quantity > 0 ? asset.total_quantity : "—"}
        </TableCell>
        <TableCell>{formatPrice(asset.avg_price)}</TableCell>
        <TableCell>
          {marketPrice === undefined ? t("loading") : formatPrice(marketPrice)}
        </TableCell>
        <TableCell>
          <ReturnPct value={calcReturnPct(marketPrice, asset.avg_price)} />
        </TableCell>
        {/* 操作列：删除资产 + 展开/收起交易记录 */}
        <TableCell className="text-right space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteAsset();
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* 点击冒泡到整行的 onClick 展开，这里不再重复绑定 */}
          <Button variant="ghost" size="icon">
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </Button>
        </TableCell>
      </MotionTableRow>

      {/* 展开行 — AnimatePresence 控制进出场 */}
      <AnimatePresence>
        {expanded && (
          <TableRow key={`${asset.id}-expanded`}>
            <TableCell colSpan={8} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" as const }}
                style={{ overflow: "hidden" }}
              >
                <div className="bg-muted/30 p-4">
                  <TransactionList
                    transactions={transactions}
                    loading={loadingTransactions}
                    onDelete={onDeleteTransaction}
                  />
                  <button
                    className="mt-3 text-sm text-primary flex items-center gap-1 hover:underline cursor-pointer"
                    onClick={onRecordTransaction}
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
  );
}

function ConfirmDeleteDialog({
  open,
  onClose,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  const t = useTranslations("pages.assets");

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" size="default">
            {t("table.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t("table.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
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
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  {t("noData")}
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset, index) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  index={index}
                  marketPrice={currentPrices[asset.symbol]}
                  expanded={expandedId === asset.id}
                  loadingTransactions={loadingId === asset.id}
                  transactions={transactionsMap[asset.id]}
                  onToggleExpand={() => handleExpand(asset.id)}
                  onDeleteAsset={() => setDeletingAssetId(asset.id)}
                  onDeleteTransaction={(transactionId) =>
                    setDeletingTx({ id: transactionId, assetId: asset.id })
                  }
                  onRecordTransaction={() => setTransactionOpenId(asset.id)}
                />
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

      <ConfirmDeleteDialog
        open={deletingAssetId !== null}
        onClose={() => setDeletingAssetId(null)}
        title={t("table.deleteAsset")}
        description={t("table.deleteAssetDesc")}
        onConfirm={confirmDeleteAsset}
      />
      <ConfirmDeleteDialog
        open={deletingTx !== null}
        onClose={() => setDeletingTx(null)}
        title={t("table.deleteTransaction")}
        description={t("table.deleteTransactionDesc")}
        onConfirm={confirmDeleteTransaction}
      />
    </>
  );
}
