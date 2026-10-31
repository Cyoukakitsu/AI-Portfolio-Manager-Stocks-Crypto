import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Asset } from "@/features/assets/types";

// Storybook 用的示例持仓与行情，数据均为虚构。
// 组件通过 react-query 读取行情，这里把示例行情预先放进缓存，组件不会发任何网络请求。

const base = { user_id: "demo", created_at: "2025-01-02T00:00:00Z" };

export const sampleAssets: Asset[] = [
  { ...base, id: "a1", symbol: "BTC-USD", fullname: "Bitcoin", asset_type: "crypto", avg_price: 77400, total_cost: 32508, total_quantity: 0.42 },
  { ...base, id: "a2", symbol: "ETH-USD", fullname: "Ethereum", asset_type: "crypto", avg_price: 3626, total_cost: 21030.8, total_quantity: 5.8 },
  { ...base, id: "a3", symbol: "SOL-USD", fullname: "Solana", asset_type: "crypto", avg_price: 165.1, total_cost: 10236.2, total_quantity: 62 },
  { ...base, id: "a4", symbol: "AAPL", fullname: "Apple Inc.", asset_type: "stock", avg_price: 216.5, total_cost: 8660, total_quantity: 40 },
  { ...base, id: "a5", symbol: "NVDA", fullname: "NVIDIA Corp.", asset_type: "stock", avg_price: 156, total_cost: 3900, total_quantity: 25 },
  { ...base, id: "a6", symbol: "VOO", fullname: "Vanguard S&P 500 ETF", asset_type: "etf", avg_price: 520, total_cost: 5200, total_quantity: 10 },
  { ...base, id: "a7", symbol: "USD", fullname: "US Dollar", asset_type: "cash", avg_price: 1, total_cost: 2500, total_quantity: 2500 },
];

const quotes = {
  "BTC-USD": { price: 97420.5, prevClose: 95380.0 },
  "ETH-USD": { price: 3418.2, prevClose: 3465.7 },
  "SOL-USD": { price: 214.35, prevClose: 204.5 },
  AAPL: { price: 231.8, prevClose: 230.97 },
  NVDA: { price: 148.65, prevClose: 150.03 },
  VOO: { price: 538.4, prevClose: 536.9 },
  USD: { price: null, prevClose: null },
};

// 每个 story 一个独立的 QueryClient，缓存键必须与 use-asset-table / use-total-asset-card 一致
export function withSeededQuotes(assets: Asset[]) {
  return function Decorator({ children }: { children: ReactNode }) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(["quotes", assets.map((a) => a.symbol).join(",")], quotes);
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}
