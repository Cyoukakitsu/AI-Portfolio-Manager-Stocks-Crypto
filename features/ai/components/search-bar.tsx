"use client";

// 股票/加密货币/ETF 搜索栏组件，支持实时搜索下拉和 AI 分析提交
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SearchResult = {
  symbol: string; // 股票代码，如 AAPL
  fullname: string; // 公司全称
  type: string; // 资产类型，如 stock / crypto
};

type SearchBarProps = {
  onAnalyze: (text: string) => void; // 提交分析时的回调
  isLoading: boolean; // AI 分析进行中
  disabled: boolean; // 外部禁用控制
};

export function SearchBar({ onAnalyze, isLoading, disabled }: SearchBarProps) {
  const [query, setQuery] = useState<string>(""); // 输入框当前值
  const [debouncedQuery, setDebouncedQuery] = useState<string>(""); // 防抖后的查询值
  const [selectedSymbol, setSelectedSymbol] = useState<string>(""); // 从下拉选中的代码

  // 防抖：输入为空时立即清空，否则延迟 400ms 再触发搜索
  useEffect(() => {
    const delay = query.trim().length < 1 ? 0 : 500;
    const timer = setTimeout(() => setDebouncedQuery(query), delay);
    return () => clearTimeout(timer);
  }, [query]);

  // 调用 Yahoo Finance 搜索 API，仅在有输入且未选中代码时触发
  const { data, isFetching } = useQuery<SearchResult[]>({
    queryKey: ["ai-symbol-search", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/yahoofinance/search?q=${encodeURIComponent(debouncedQuery)}`,
      );
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: debouncedQuery.trim().length >= 1 && !selectedSymbol,
    staleTime: 5 * 60 * 1000, // 5 分钟内不重复请求
  });

  const results = data ?? [];
  // 有输入且尚未从下拉选中时，显示搜索下拉列表
  const showDropdown = debouncedQuery.trim().length >= 1 && !selectedSymbol;

  // 从下拉列表选中一个结果：填充输入框并记录选中的代码
  function handleSelect(result: SearchResult) {
    setSelectedSymbol(result.symbol);
    setQuery(result.symbol);
  }

  // 提交分析：优先使用下拉选中的代码，否则使用手动输入值，提交后重置状态
  const handleSubmit = () => {
    const symbol = selectedSymbol || query.trim();
    if (!symbol) return;
    onAnalyze(symbol.toUpperCase());
    setQuery("");
    setSelectedSymbol("");
    setDebouncedQuery("");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1">
        <Command className="border rounded-3xl" shouldFilter={false}>
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
              onValueChange={(val) => {
                setQuery(val);
                // 用户修改输入时，清除之前的选中状态
                if (selectedSymbol && val !== selectedSymbol) {
                  setSelectedSymbol("");
                }
              }}
              // 下拉关闭时按 Enter 直接提交
              onKeyDown={(e) =>
                e.key === "Enter" && !showDropdown && handleSubmit()
              }
              disabled={isLoading}
              className="flex-1 bg-transparent outline-none py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* 搜索下拉列表 */}
          {showDropdown && (
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
        disabled={disabled || isLoading || !(selectedSymbol || query.trim())}
        className="rounded-3xl px-6 w-full sm:w-auto sm:self-start sm:mt-0.5"
      >
        {isLoading ? "Loading..." : "Analyze"}
      </Button>
    </div>
  );
}
