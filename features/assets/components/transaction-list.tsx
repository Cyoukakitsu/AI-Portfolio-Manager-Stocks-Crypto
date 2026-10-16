"use client";

// 展开行内的交易记录子表
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import type { Transaction } from "@/features/assets/types";

type Props = { transactions: Transaction[]; onDelete: (id: string) => void };

export function TransactionList({ transactions, onDelete }: Props) {
  const t = useTranslations("pages.assets");
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
            <TableHead>
              {t("table.price")}
            </TableHead>
            <TableHead>
              {t("table.quantity")}
            </TableHead>
            <TableHead>{t("table.type")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="text-sm">
                {tx.traded_at}
              </TableCell>
              <TableCell className="text-sm">
                ${tx.price}
              </TableCell>
              <TableCell className="text-sm">
                {tx.quantity}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    tx.type === "buy"
                      ? "default"
                      : "secondary"
                  }
                >
                  {tx.type === "buy"
                    ? t("table.buy")
                    : t("table.sell")}
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
