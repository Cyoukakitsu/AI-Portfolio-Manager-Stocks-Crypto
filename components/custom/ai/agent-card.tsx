"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentResult } from "@/types/ai";
import { PERSONA_META, VERDICT_LABEL, VERDICT_STYLE } from "@/lib/ai/constants";

type AgentCardProps = AgentResult;

export function AgentCard({ persona, score, verdict, points }: AgentCardProps) {
  const meta = PERSONA_META[persona];
  const verdictLabel = VERDICT_LABEL[verdict];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* 左侧：emoji + 名字 + 职称 */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.emoji}</span>
            <div>
              <p className="text-sm font-medium">{meta.name}</p>
              <p className="text-xs text-muted-foreground">{meta.role}</p>
            </div>
          </div>
          {/* 右侧：verdict badge */}
          <Badge className={VERDICT_STYLE[verdict]}>{verdictLabel}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* 分数进度条 */}
        <div className="mb-4 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Score</span>
            <span className="font-medium text-foreground">{score} / 100</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* 3个分析观点 */}
        <ul className="space-y-2">
          {points.map((point, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-border shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
