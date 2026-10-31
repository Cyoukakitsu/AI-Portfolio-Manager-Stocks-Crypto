import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Card } from "./card";

// 模拟持仓表：用来验证数字右对齐、等宽、红涨绿跌与 ▲▼ 符号、表格密度。数据均为虚构。
const rows = [
  { sym: "BTC", name: "Bitcoin", qty: "0.4200", price: "97,420.50", value: "40,916.61", chg: 2.14, pnl: 8412.3 },
  { sym: "ETH", name: "Ethereum", qty: "5.8", price: "3,418.20", value: "19,826.56", chg: -1.37, pnl: -1204.88 },
  { sym: "SOL", name: "Solana", qty: "62", price: "214.35", value: "13,289.70", chg: 4.82, pnl: 3051.1 },
  { sym: "AAPL", name: "Apple", qty: "40", price: "231.80", value: "9,272.00", chg: 0.36, pnl: 612.4 },
  { sym: "NVDA", name: "NVIDIA", qty: "25", price: "148.65", value: "3,716.25", chg: -0.92, pnl: -184.75 },
  { sym: "TSLA", name: "Tesla", qty: "12", price: "342.10", value: "4,105.20", chg: -2.45, pnl: -310.6 },
];
const fmt = (n: number) =>
  Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const meta = { title: "UI/Table", component: Table } satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Holdings: Story = {
  render: () => (
    <Card className="max-w-4xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>资产</TableHead>
            <TableHead className="text-right">持仓量</TableHead>
            <TableHead className="text-right">现价</TableHead>
            <TableHead className="text-right">市值</TableHead>
            <TableHead className="text-right">24h</TableHead>
            <TableHead className="text-right">盈亏</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.sym}>
              <TableCell>
                <div className="font-semibold text-strong">{r.sym}</div>
                <div className="text-xs text-faint">{r.name}</div>
              </TableCell>
              <TableCell className="num text-right">{r.qty}</TableCell>
              <TableCell className="num text-right">{r.price}</TableCell>
              <TableCell className="num text-right">{r.value}</TableCell>
              <TableCell className={`num text-right ${r.chg >= 0 ? "text-up" : "text-down"}`}>
                {r.chg >= 0 ? "▲" : "▼"} {Math.abs(r.chg).toFixed(2)}%
              </TableCell>
              <TableCell className={`num text-right ${r.pnl >= 0 ? "text-up" : "text-down"}`}>
                {r.pnl >= 0 ? "+" : "−"}
                {fmt(r.pnl)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  ),
};
