"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Finnhub 搜索结果的类型
type SearchResult = {
  symbol: string;
  fullname: string;
  type: string;
};

type Props = {
  // 选中某个结果后，把数据回传给父组件
  onSelect: (result: SearchResult) => void;
  // 用于显示当前已选的 symbol（编辑模式下）
  defaultValue?: string;
};

export function SymbolSearch({ onSelect, defaultValue = "" }: Props) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // 用 ref 存 debounce 的 timer，避免每次渲染都重新创建
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 少于 1 个字符时不搜索
    if (query.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Debounce：用户停止输入 400ms 后才发请求，避免每输入一个字就请求一次
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    // cleanup：组件卸载或 query 变化时清除 timer
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  function handleSelect(result: SearchResult) {
    setQuery(result.symbol); // 选中后输入框显示 symbol
    setOpen(false);
    onSelect(result); // 回传给父组件
  }

  return (
    <div className="relative">
      <Command className="border rounded-md" shouldFilter={false}>
        {/* shouldFilter=false：关闭 Command 的本地过滤，因为我们用服务端搜索 */}
        <div className="flex items-center px-3">
          {loading ? (
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

        {/* 只在有搜索词时显示下拉列表 */}
        {open && (
          <CommandList>
            {results.length === 0 && !loading ? (
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
