"use client";

// 智能资产分析助手
// 它接收一个资产数组作为 props，调用后端 API 进行资产分析，并在组件中显示摘要内容
import { useRef, useState } from "react";
import type { Asset } from "@/types/global";
import { useTranslations, useLocale } from "next-intl";

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

type Props = { assets: Asset[] };

export function PortfolioAISummary({ assets }: Props) {
  const t = useTranslations("aiSummary");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Dialogの開閉を制御 → 開いたときだけrun()を呼ぶ
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      run(); // 開いた瞬間に分析開始
    } else {
      abortRef.current?.abort(); // 閉じたらキャンセル
    }
    setOpen(nextOpen);
  }

  async function run() {
    if (assets.length === 0) return;
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

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setText(t("fetchError"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        {/* ローディング or 結果表示 */}
        <div className="min-h-50 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
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
            <div className="prose prose-sm dark:prose-invert max-w-none text-[13px] leading-relaxed">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
