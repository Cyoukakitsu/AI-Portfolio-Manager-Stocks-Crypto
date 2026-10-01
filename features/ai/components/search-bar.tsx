"use client";

// 股票/加密货币/ETF 搜索栏组件，支持实时搜索下拉和 AI 分析提交
import { Button } from "@/components/ui/button";
import { useSymbolSearch } from "@/lib/hooks/use-symbol-search";
import { Search, Loader2 } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SearchBarProps = {
  onAnalyze: (text: string) => void; // 提交分析时的回调
  isLoading: boolean; // AI 分析进行中
  disabled: boolean; // 外部禁用控制
};

export function SearchBar({ onAnalyze, isLoading, disabled }: SearchBarProps) {
  const { query, setQuery, results, isFetching, open, handleSelect } =
    useSymbolSearch();

  // 提交分析：选中下拉项时 query 已被改写为该代码，所以直接用 query；提交后清空
  const handleSubmit = () => {
    const symbol = query.trim();
    if (!symbol) return;
    onAnalyze(symbol.toUpperCase());
    setQuery("");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1">
        <Command className="border rounded-md" shouldFilter={false}>
          <div className="flex items-center px-6">
            {/* 搜索中显示加载动画，否则显示搜索图标 */}
            {isFetching ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-muted-foreground shrink-0" />
            ) : (
              <Search className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
            )}
            <CommandPrimitive.Input
              placeholder="Enter stock/crypto/etf symbol"
              value={query}
              onValueChange={setQuery}
              disabled={isLoading}
              className="flex-1 bg-transparent outline-none py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* 搜索下拉列表 */}
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

      {/* 提交按钮：无输入、加载中、或外部禁用时不可点击 */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || isLoading || !query.trim()}
        className="px-6 w-full sm:w-auto sm:self-start sm:mt-0.5"
      >
        {isLoading ? "Loading..." : "Analyze"}
      </Button>
    </div>
  );
}
