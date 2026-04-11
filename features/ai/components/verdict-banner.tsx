"use client";

import { Badge } from "@/components/ui/badge";
import { CoordinatorResult } from "@/features/ai/types";
import { VERDICT_LABEL, VERDICT_STYLE } from "@/features/ai/lib/constants";
import { useTranslations } from "next-intl";

type VerdictBannerProps = Pick<
  CoordinatorResult,
  "verdict" | "score" | "summary"
>;

export function VerdictBanner({ verdict, score, summary }: VerdictBannerProps) {
  const t = useTranslations("verdict");

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 rounded-lg border p-3 sm:p-4">
      <Badge className={`text-sm px-3 py-1 ${VERDICT_STYLE[verdict]}`}>{VERDICT_LABEL[verdict]}</Badge>
      <span className="text-sm text-muted-foreground">{t("score")}</span>
      <div className="w-20 sm:w-24 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium">{score}</span>
      <p className="text-sm text-muted-foreground w-full sm:flex-1 sm:w-auto">{summary}</p>
    </div>
  );
}
