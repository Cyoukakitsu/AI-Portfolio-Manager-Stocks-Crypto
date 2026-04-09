"use client";

// 智能资产分析助手
// 它接收一个资产数组作为 props，调用后端 API 进行资产分析，并在组件中显示摘要内容
import { useRef, useState } from "react";
import type { Asset } from "@/types/global";
import { useTranslations, useLocale } from "next-intl";

import { Bot, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

type Props = { assets: Asset[] };

function AnalysisContent({ assets }: Props) {
  const t = useTranslations("aiSummary");
  const locale = useLocale();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null); // 最后更新时间
  const abortRef = useRef<AbortController | null>(null); // 用于取消之前的分析请求

  // 运行资产分析
  async function run() {
    if (assets.length === 0) return;
    // 取消之前的分析请求, 避免重复请求,并创建一个新的 AbortController 用于当前分析请求
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setText("");
    setLoading(true);
    try {
      const res = await fetch("/api/assets/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets, locale }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error("fetch failed");

      // 流式处理响应体,并实时更新组件状态中的摘要内容
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }
      setLastUpdated(new Date());
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setText(t("fetchError"));
      }
    } finally {
      setLoading(false);
    }
  }

  // 初始化时自动运行一次资产分析,避免重复运行
  const hasRun = useRef(false);
  if (!hasRun.current) {
    hasRun.current = true;
    run();
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {loading
            ? t("analyzing")
            : lastUpdated
              ? `更新: ${lastUpdated.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`
              : ""}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={run}
          disabled={loading}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {t("reanalyze")}
        </Button>
      </div>

      {/* Content */}
      <div className="min-h-50 max-h-[60vh] overflow-y-auto pr-1">
        {loading && text === "" ? (
          <div className="space-y-2.5 animate-pulse pt-2">
            {[75, 55, 85, 45, 65, 70, 50].map((w, i) => (
              <div
                key={i}
                className="h-3 rounded bg-muted"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : text ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-[13px] leading-relaxed
              [&_h2]:text-[11px] [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-widest
              [&_h2]:text-muted-foreground [&_h2]:mt-4 [&_h2]:mb-2 [&_h2:first-child]:mt-0
              [&_ul]:my-1.5 [&_li]:my-0.5 [&_p]:my-1.5"
          >
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        ) : assets.length === 0 ? (
          <p className="text-[12px] text-muted-foreground text-center mt-8">
            {t("emptyState")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PortfolioAISummary({ assets }: Props) {
  const t = useTranslations("aiSummary");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Card body — minimal, no content overflow */}
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
              className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
              disabled={assets.length === 0}
            />
          }
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t("startAnalysis")}
        </DialogTrigger>
      </div>

      <DialogContent className="w-[95vw] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-violet-500" />
            {t("title")}
          </DialogTitle>
        </DialogHeader>
        {open && <AnalysisContent assets={assets} />}
      </DialogContent>
    </Dialog>
  );
}
