"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AgentCardProps = {
  persona: string;
  score: number;
  verdict: "buy" | "hold" | "sell";
  points: string[];
};

const PERSONA_META: Record<
  string,
  { name: string; emoji: string; role: string }
> = {
  buffett: {
    name: "Warren Buffett",
    emoji: "🏛️",
    role: "Father of Value Investing",
  },
  lynch: { name: "Peter Lynch", emoji: "📈", role: "Growth Stock Hunter" },
  wood: {
    name: "Cathie Wood",
    emoji: "🚀",
    role: "Queen of Disruptive Innovation",
  },
  burry: { name: "Michael Burry", emoji: "🐻", role: "Contrarian Master" },
  dalio: { name: "Ray Dalio", emoji: "🌏", role: "Macro Cycle Hunter" },
};

const VERDICT_MAP = {
  buy: "Buy",
  hold: "Hold",
  sell: "Sell",
};

export function AgentCard({ persona, score, verdict, points }: AgentCardProps) {
  const meta = PERSONA_META[persona];
  const verdictLabel = VERDICT_MAP[verdict];

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
          {/* 右侧：verdict badge + 评分 */}
          <div className="flex items-center gap-2">
            <Badge>{verdictLabel}</Badge>
            <span className="text-lg font-medium">{score}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
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
