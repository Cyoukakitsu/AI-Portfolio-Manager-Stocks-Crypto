"use client";

import { Badge } from "@/components/ui/badge";
import { CoordinatorResult } from "@/types/ai";
import { VERDICT_LABEL, VERDICT_STYLE } from "@/lib/ai/constants";
import { useTranslations } from "next-intl";

type VerdictBannerProps = Pick<
  CoordinatorResult,
  "verdict" | "score" | "summary"
>;

export function VerdictBanner({ verdict, score, summary }: VerdictBannerProps) {
  const t = useTranslations("verdict");

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <Badge className={`text-sm px-3 py-1 ${VERDICT_STYLE[verdict]}`}>{VERDICT_LABEL[verdict]}</Badge>
      <span className="text-sm text-muted-foreground">{t("score")}</span>
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
