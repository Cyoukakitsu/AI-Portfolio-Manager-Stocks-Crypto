"use client";

// 股票/加密货币符号实时搜索组件
// 设计模式：受控搜索框 + 防抖（Debounce）+ 服务端中转

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// 搜索结果的数据结构（对应 /api/search 的返回格式）
type SearchResult = {
  symbol: string;
  fullname: string;
  type: string;
};

type Props = {
  // 选中结果后将数据回传给父组件（data-form.tsx）
  onSelect: (result: SearchResult) => void;
  // 编辑模式下预填当前已选的 symbol
  defaultValue?: string;
};

export function SymbolSearch({ onSelect, defaultValue = "" }: Props) {
  const [query, setQuery] = useState(defaultValue);
  // 防抖后的 query，只用于触发请求，与输入框值解耦
  const [debouncedQuery, setDebouncedQuery] = useState(defaultValue);

  // 防抖：空字符串立即清除（0ms），有内容时延迟 400ms，始终通过 timer 异步更新
  useEffect(() => {
    const delay = query.trim().length < 1 ? 0 : 400;
    const timer = setTimeout(() => setDebouncedQuery(query), delay);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = useQuery<SearchResult[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/yahoofinance/search?q=${encodeURIComponent(debouncedQuery)}`,
      );
      const data = await res.json();
      // 容错处理：API 异常时返回的可能不是数组，加 Array.isArray 防止 crash
      return Array.isArray(data) ? data : [];
    },
    enabled: debouncedQuery.trim().length >= 1,
    staleTime: 5 * 60 * 1000, // 相同关键词 5 分钟内不重复请求
  });

  const results = data ?? [];
  const open = debouncedQuery.trim().length >= 1;

  function handleSelect(result: SearchResult) {
    setQuery(result.symbol); // 选中后输入框显示 symbol 而非 fullname
    onSelect(result); // 通知父组件同步填充其他表单字段
  }

  return (
    <div className="relative">
      <Command className="border rounded-md" shouldFilter={false}>
        <div className="flex items-center px-3">
          {/* 搜索中显示 loading 动画，否则显示搜索图标，提供即时反馈 */}
          {isFetching ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-muted-foreground" />
          ) : (
            <Search className="w-4 h-4 mr-2 text-muted-foreground" />
          )}
          <CommandInput
            placeholder="Search symbol or name..."
            value={query}
            onValueChange={setQuery}
            className="border-0 focus:ring-0"
          />
        </div>

        {/* 只在有搜索词且用户已触发过搜索时才显示下拉列表 */}
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
