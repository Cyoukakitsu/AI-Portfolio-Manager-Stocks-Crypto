"use client";

import { Badge } from "@/components/ui/badge";

type VerdictBannerProps = {
  verdict: "buy" | "hold" | "sell";
  score: number;
  summary: string;
};

const VERDICT_MAP = {
  buy: "Buy",
  hold: "Hold",
  sell: "Sell",
};

export function VerdictBanner({ verdict, score, summary }: VerdictBannerProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <Badge className="text-sm px-3 py-1">{VERDICT_MAP[verdict]}</Badge>
      <span className="text-sm text-muted-foreground">Score</span>
      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium">{score}</span>
      <p className="text-sm text-muted-foreground flex-1">{summary}</p>
    </div>
  );
}
