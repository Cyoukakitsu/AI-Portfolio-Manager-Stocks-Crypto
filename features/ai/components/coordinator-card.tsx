"use client";

// 协调者综合两位分析师观点后的最终结论卡片
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CoordinatorResult } from "@/features/ai/types";
import { VERDICT_STYLE } from "@/features/ai/lib/constants";

export function CoordinatorCard({
  verdict,
  score,
  summary,
  buyRange,
}: CoordinatorResult) {
  const t = useTranslations("pages.ai");
  const tVerdict = useTranslations("verdict");
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <div>
              <p className="text-sm font-medium">{t("coordinatorName")}</p>
              <p className="text-xs text-muted-foreground">{t("coordinatorRole")}</p>
            </div>
          </div>
          {/* verdict 标签 + score 进度条 */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-sm px-3 py-1 ${VERDICT_STYLE[verdict]}`}>{tVerdict(verdict)}</Badge>
            <span className="text-sm text-muted-foreground">{tVerdict("score")}</span>
            <div className="w-20 sm:w-24 h-2 rounded-full bg-muted overflow-hidden">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 左侧：综合摘要 */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>

          {/* 右侧：目标价格区间 */}
          {buyRange.low > 0 && buyRange.high > 0 && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t("targetPriceRange")}
              </p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                ${buyRange.low} – ${buyRange.high}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("combinedRangeNote")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
