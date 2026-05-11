"use client";

// 股票/加密货币符号实时搜索组件
// 逻辑层见 hooks/use-symbol-search.ts

import { Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSymbolSearch, type SearchResult } from "@/features/assets/hooks/use-symbol-search";

type Props = {
  // 选中结果后将数据回传给父组件（asset-form.tsx）
  onSelect: (result: SearchResult) => void;
  // 编辑模式下预填当前已选的 symbol
  defaultValue?: string;
};

export function SymbolSearch({ onSelect, defaultValue = "" }: Props) {
  const { query, setQuery, results, isFetching, open, handleSelect } =
    useSymbolSearch({ defaultValue, onSelect });

  return (
    <div className="relative">
      <Command className="border rounded-md" shouldFilter={false}>
        <div className="relative">
          <CommandInput
            placeholder="Search symbol or name..."
            value={query}
            onValueChange={setQuery}
            className="border-0 focus:ring-0"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* 只在有搜索词时才显示下拉列表 */}
        {open && (
          <CommandList>
            {results.length === 0 && !isFetching ? (
              <CommandEmpty>No results found</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((item) => (
                  <CommandItem
                    key={item.symbol}
                    value={item.symbol}
                    onSelect={() => handleSelect(item)}
                    className="flex justify-between"
                  >
                    <div>
                      <span className="font-medium">{item.symbol}</span>
                      <span className="ml-2 text-muted-foreground text-sm">
                        {item.fullname}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.type}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
