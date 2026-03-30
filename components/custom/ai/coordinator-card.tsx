"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CoordinatorResult, VERDICT_LABEL, VERDICT_STYLE } from "@/types/ai";

export function CoordinatorCard({
  verdict,
  score,
  summary,
  keyLevels,
}: CoordinatorResult) {
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
          {/* verdict 标签 + score 进度条 */}
          <div className="flex items-center gap-3">
            <Badge className={`text-sm px-3 py-1 ${VERDICT_STYLE[verdict]}`}>{VERDICT_LABEL[verdict]}</Badge>
            <span className="text-sm text-muted-foreground">Score</span>
            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-sm font-medium">{score}</span>
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
