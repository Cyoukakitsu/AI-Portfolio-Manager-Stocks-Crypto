"use client";

import { useState } from "react";
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
import { AssetForm } from "@/components/custom/assets/data-form";
import { deleteAsset } from "@/services/assets";
import type { Asset } from "@/types/global";

type Props = {
  assets: Asset[];
};

export function AssetsTable({ assets }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这条资产吗？")) return;
    setDeletingId(id);
    try {
      await deleteAsset(id);
    } catch (err) {
      console.error(err);
      alert("删除失败");
    } finally {
      setDeletingId(null);
    }
  }

  // 根据 asset_type 给 Badge 不同颜色
  function getBadgeVariant(type: string) {
    const map: Record<string, "default" | "secondary" | "outline"> = {
      crypto: "default",
      stock: "secondary",
      etf: "outline",
    };
    return map[type] ?? "outline";
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>全名</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.length === 0 ? (
          <TableRow>
            {/* colSpan 让这一行横跨所有列 */}
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground"
            >
              暂无数据
            </TableCell>
          </TableRow>
        ) : (
          assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.symbol}</TableCell>
              <TableCell>{asset.fullname}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(asset.asset_type)}>
                  {asset.asset_type}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(asset.created_at).toLocaleDateString("zh-CN")}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {/* 编辑按钮：把 Button 作为 trigger 传给 AssetForm */}
                <AssetForm
                  asset={asset}
                  trigger={
                    <Button variant="outline" size="sm">
                      编辑
                    </Button>
                  }
                />
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === asset.id}
                  onClick={() => handleDelete(asset.id)}
                >
                  {deletingId === asset.id ? "删除中..." : "删除"}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
