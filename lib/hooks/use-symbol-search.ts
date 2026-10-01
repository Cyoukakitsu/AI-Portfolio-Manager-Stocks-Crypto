// 股票/加密货币/ETF 代码搜索：输入防抖 + 查询 + 选中后收起下拉
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchSymbols, type SearchResult } from "@/lib/market-api";

export type { SearchResult };

type Params = {
  defaultValue?: string;
  onSelect?: (result: SearchResult) => void;
};

export function useSymbolSearch({ defaultValue = "", onSelect }: Params = {}) {
  const [query, setQuery] = useState(defaultValue);
  // query 绑定输入框；debouncedQuery 才触发请求，避免每敲一个字发一次
  const [debouncedQuery, setDebouncedQuery] = useState(defaultValue);
  // 选中结果后会改写 query，用它让下一次防抖不再重新弹出下拉
  const skipNextDebounce = useRef(false);

  useEffect(() => {
    if (skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }
    // 空字符串立即清除，有内容时延迟 400ms
    const delay = query.trim().length < 1 ? 0 : 400;
    const timer = setTimeout(() => setDebouncedQuery(query), delay);
    return () => clearTimeout(timer);
  }, [query]);

  const open = debouncedQuery.trim().length >= 1;

  const { data, isFetching } = useQuery<SearchResult[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchSymbols(debouncedQuery),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  function handleSelect(result: SearchResult) {
    skipNextDebounce.current = true;
    setQuery(result.symbol);
    setDebouncedQuery(""); // 立即关闭下拉
    onSelect?.(result);
  }

  return { query, setQuery, results: data ?? [], isFetching, open, handleSelect };
}
