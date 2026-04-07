"use client";

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
  symbol: string;
  fullname: string;
  type: string;
};

type SearchBarProps = {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
  disabled: boolean;
};

export function SearchBar({ onAnalyze, isLoading, disabled }: SearchBarProps) {
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  useEffect(() => {
    const delay = query.trim().length < 1 ? 0 : 400;
    const timer = setTimeout(() => setDebouncedQuery(query), delay);
    return () => clearTimeout(timer);
  }, [query]);

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
    staleTime: 5 * 60 * 1000,
  });

  const results = data ?? [];
  const showDropdown = debouncedQuery.trim().length >= 1 && !selectedSymbol;

  function handleSelect(result: SearchResult) {
    setSelectedSymbol(result.symbol);
    setQuery(result.symbol);
  }

  const handleSubmit = () => {
    const symbol = selectedSymbol || query.trim();
    if (!symbol) return;
    onAnalyze(symbol.toUpperCase());
    setQuery("");
    setSelectedSymbol("");
    setDebouncedQuery("");
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Command className="border rounded-3xl" shouldFilter={false}>
          <div className="flex items-center px-6">
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
                if (selectedSymbol && val !== selectedSymbol) {
                  setSelectedSymbol("");
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && !showDropdown && handleSubmit()}
              disabled={isLoading}
              className="flex-1 bg-transparent outline-none py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

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
      <Button
        onClick={handleSubmit}
        disabled={disabled || isLoading || !(selectedSymbol || query.trim())}
        className="rounded-3xl px-6 self-start mt-0.5"
      >
        {isLoading ? "Loading..." : "Analyze"}
      </Button>
    </div>
  );
}
