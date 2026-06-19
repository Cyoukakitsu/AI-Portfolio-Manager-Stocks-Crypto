"use client";

// 智能资产分析助手
// 逻辑层见 hooks/use-portfolio-ai-summary.ts

import type { Asset } from "@/features/assets/types";
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
import remarkGfm from "remark-gfm";
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
      <DialogContent className="w-[95vw] max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" />
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        {/* 流式渲染：有 text 立即显示，loading 时仅在 text 为空才显示占位 */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {text ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-[13px] leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full min-h-50 text-sm text-muted-foreground">
              {t("analyzing")}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
