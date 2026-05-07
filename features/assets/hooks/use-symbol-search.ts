// 股票/加密货币/ETF 搜索栏组件，支持实时搜索下拉和 AI 分析提交

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
  // query 是输入框绑定的值，用户每敲一个字就更新一次。
  const [debouncedQuery, setDebouncedQuery] = useState(defaultValue);
  // debouncedQuery 是真正触发 API 请求的值，不跟输入框实时同步，而是延迟更新，避免每敲一个字就发一次请求
  const skipNextDebounce = useRef(false);
  // 一个布尔标记。useRef 的特点是改变它不会触发重新渲染，用来做"内部信号传递"。这里用于告诉 debounce effect："下次别执行"。

  useEffect(() => {
    if (skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }

    // 防抖：空字符串立即清除（0ms），有内容时延迟 400ms
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
