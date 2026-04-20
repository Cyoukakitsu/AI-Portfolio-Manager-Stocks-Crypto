// SymbolSearch コンポーネントのロジック Hook
// 職責：検索クエリ管理、デバウンス、Yahoo Finance 検索 API 呼び出し

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

export type SearchResult = {
  symbol: string;
  fullname: string;
  type: string;
};

type Params = {
  defaultValue?: string;
  onSelect: (result: SearchResult) => void;
};

export function useSymbolSearch({ defaultValue = "", onSelect }: Params) {
  const [query, setQuery] = useState(defaultValue);
  // 防抖后的 query，只用于触发请求，与输入框值解耦
  const [debouncedQuery, setDebouncedQuery] = useState(defaultValue);
  // 选中后跳过下一次 debounce，防止 dropdown 重新弹出
  const skipNextDebounce = useRef(false);

  // 防抖：空字符串立即清除（0ms），有内容时延迟 400ms
  useEffect(() => {
    if (skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }
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
      // 容错处理：API 异常时返回的可能不是数组
      return Array.isArray(data) ? data : [];
    },
    enabled: debouncedQuery.trim().length >= 1,
    staleTime: 5 * 60 * 1000,
  });

  const results = data ?? [];
  // 有搜索词时才显示下拉列表
  const open = debouncedQuery.trim().length >= 1;

  function handleSelect(result: SearchResult) {
    skipNextDebounce.current = true; // 跳过本次 debounce，防止 dropdown 重新弹出
    setQuery(result.symbol);
    setDebouncedQuery(""); // 立即关闭 dropdown
    onSelect(result);
  }

  return { query, setQuery, results, isFetching, open, handleSelect };
}
