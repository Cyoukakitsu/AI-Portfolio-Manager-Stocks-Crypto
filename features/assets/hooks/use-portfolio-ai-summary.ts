// PortfolioAISummary コンポーネントのロジック Hook
// 職責：弾窓開閉、ストリーミングリクエスト管理、AbortController による中断

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { Asset } from "@/types/global";

type Params = {
  assets: Asset[];
  fetchErrorMessage: string; // t("fetchError") の値をコンポーネント側から渡す
};

export function usePortfolioAISummary({ assets, fetchErrorMessage }: Params) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  // 流式累积的 AI 文本
  const [text, setText] = useState("");
  // 是否正在请求中
  const [loading, setLoading] = useState(false);
  // 用于取消正在进行的请求
  const abortRef = useRef<AbortController | null>(null);

  // 控制弹窗：打开时立即发起分析，关闭时中止请求
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      run();
    } else {
      abortRef.current?.abort();
    }
    setOpen(nextOpen);
  }

  // 发起 AI 分析请求（流式读取）
  async function run() {
    if (assets.length === 0) return;

    // 若上次请求还未完成，先中止
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

      // 逐块读取流式响应并追加到 text
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e: unknown) {
      // 忽略用户主动关闭弹窗触发的 AbortError
      if (e instanceof Error && e.name !== "AbortError") {
        setText(fetchErrorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  return { open, handleOpenChange, text, loading };
}
