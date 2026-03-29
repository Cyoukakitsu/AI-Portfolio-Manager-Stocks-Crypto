"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

type CoordinatorCardProps = {
  verdict: "buy" | "hold" | "sell";
  score: number;
  summary: string;
  keyLevels: {
    entry: number;
    stopLoss: number;
    target: number;
  };
};

export function CoordinatorCard({ summary, keyLevels }: CoordinatorCardProps) {
  const risk = keyLevels.entry - keyLevels.stopLoss;
  const reward = keyLevels.target - keyLevels.entry;
  const ratio = (reward / risk).toFixed(1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <div>
              <p className="text-sm font-medium">Coordinator</p>
              <p className="text-xs text-muted-foreground">Final Verdict</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* 左侧：综合摘要 */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>

          {/* 右侧：关键价位 */}
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Key Levels
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Entry Zone</span>
              <span className="font-medium">${keyLevels.entry}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stop Loss</span>
              <span className="font-medium text-destructive">
                ${keyLevels.stopLoss}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target</span>
              <span className="font-medium text-primary">
                ${keyLevels.target}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Risk / Reward</span>
              <span className="font-medium">1 : {ratio}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
