"use client";

// 分析师运行中的占位卡片——显示当前正在调用的工具
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { AgentPersona } from "@/features/ai/types";
import { PERSONA_META } from "@/features/ai/lib/constants";

export function AgentPendingCard({ persona, tool }: { persona: AgentPersona; tool?: string }) {
  const t = useTranslations("pages.ai.steps");
  const tAnalyst = useTranslations("aiAnalyst");
  const meta = PERSONA_META[persona];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-medium">{meta.name}</p>
            <p className="text-xs text-muted-foreground">{tAnalyst(`${persona}.role`)}</p>
          </div>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          {tool && t.has(tool) ? t(tool) : t("start")}
        </p>
      </CardHeader>
    </Card>
  );
}
