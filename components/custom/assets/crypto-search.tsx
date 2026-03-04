"use client";

// 加密货币选择组件
// 因为 Finnhub 的 /search 接口不返回加密货币，
// 所以用本地硬编码前10主流币种 + Command 组件实现带搜索的下拉选择

import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type CryptoItem = {
  symbol: string;
  fullname: string;
};

// 前10主流加密货币
const CRYPTO_LIST: CryptoItem[] = [
  { symbol: "BTC", fullname: "Bitcoin" },
  { symbol: "ETH", fullname: "Ethereum" },
  { symbol: "BNB", fullname: "Binance Coin" },
  { symbol: "SOL", fullname: "Solana" },
  { symbol: "XRP", fullname: "XRP" },
  { symbol: "DOGE", fullname: "Dogecoin" },
  { symbol: "ADA", fullname: "Cardano" },
  { symbol: "AVAX", fullname: "Avalanche" },
  { symbol: "DOT", fullname: "Polkadot" },
  { symbol: "MATIC", fullname: "Polygon" },
];

type Props = {
  onSelect: (result: CryptoItem) => void;
  defaultValue?: string;
};

export function CryptoSearch({ onSelect, defaultValue = "" }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // 根据输入过滤币种列表（本地过滤，不需要 API）
  const filtered = CRYPTO_LIST.filter(
    (item) =>
      item.symbol.toLowerCase().includes(query.toLowerCase()) ||
      item.fullname.toLowerCase().includes(query.toLowerCase()),
  );

  function handleSelect(item: CryptoItem) {
    setQuery("");
    setOpen(false);
    onSelect(item);
  }

  return (
    <Command className="border rounded-md" shouldFilter={false}>
      <div className="flex items-center px-3">
        <CommandInput
          value={query}
          onValueChange={(val) => {
            setQuery(val);
            setOpen(val.length > 0);
          }}
          // 显示已选的 symbol（defaultValue）作为 placeholder
          placeholder={defaultValue || "Search crypto..."}
        />
      </div>

      {open && (
        <CommandList>
          {filtered.length === 0 ? (
            <CommandEmpty>No results found</CommandEmpty>
          ) : (
            <CommandGroup>
              {filtered.map((item) => (
                <CommandItem
                  key={item.symbol}
                  value={item.symbol}
                  onSelect={() => handleSelect(item)}
                  className="flex justify-between"
                >
                  <span className="font-medium">{item.symbol}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.fullname}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
}
