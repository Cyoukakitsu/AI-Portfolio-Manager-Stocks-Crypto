"use client";

// 智能资产分析助手
// 逻辑层见 hooks/use-portfolio-ai-summary.ts

import type { Asset } from "@/types/global";
import { useTranslations } from "next-intl";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { usePortfolioAISummary } from "@/features/assets/hooks/use-portfolio-ai-summary";

type Props = { assets: Asset[] };

export function PortfolioAISummary({ assets }: Props) {
  const t = useTranslations("aiSummary");

  const { open, handleOpenChange, text, loading } = usePortfolioAISummary({
    assets,
    fetchErrorMessage: t("fetchError"),
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* 触发区域：标题描述 + 分析按钮 */}
      <div className="px-3 sm:px-5 py-4 flex flex-col items-center justify-center gap-3 text-center">
        <div>
          <p className="text-[13px] font-medium">{t("title")}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {t("description")}
          </p>
        </div>
        <DialogTrigger
          render={
            <Button
              size="sm"
              className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={assets.length === 0}
            />
          }
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t("startAnalysis")}
        </DialogTrigger>
      </div>

      {/* 分析结果弹窗 */}
      <DialogContent className="w-[95vw] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" />
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        {/* 加载中：骨架屏动画；加载完成：渲染 Markdown */}
        <div className="min-h-50 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="space-y-2.5 animate-pulse pt-2">
              {[75, 55, 85, 45, 65, 70, 50].map((w, i) => (
                <div key={i} className="h-3 rounded bg-muted" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : text ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-[13px] leading-relaxed">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
