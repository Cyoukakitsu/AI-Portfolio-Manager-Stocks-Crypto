"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type SearchBarProps = {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
  disabled: boolean;
};

export function SearchBar({ onAnalyze, isLoading, disabled }: SearchBarProps) {
  const [symbol, setSymbol] = useState<string>("");

  const handleSubmit = () => {
    if (!symbol.trim()) return;
    onAnalyze(symbol.trim().toUpperCase());
    setSymbol("");
  };

  return (
    <div className="flex  gap-2">
      <Input
        placeholder="Enter stock/crypto/etf symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={isLoading}
        className="flex-1 rounded-3xl px-6 py-4 text-lg "
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || isLoading || !symbol.trim()}
        className="rounded-3xl px-6"
      >
        {isLoading ? "Loading..." : "Analyze"}
      </Button>
    </div>
  );
}
