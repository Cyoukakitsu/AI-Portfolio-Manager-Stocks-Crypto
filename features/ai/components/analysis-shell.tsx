"use client";

// AI 分析功能的 "容器 / 外壳组件" ——
//  - 整合全流程的 UI 布局
//  - 整合基础交互逻辑
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Brain } from "lucide-react";
import type { AgentPersona, AnalysisResult } from "@/features/ai/types";
import { SearchBar } from "./search-bar";
import { AgentSelector } from "./agent-selector";
import { ProgressSteps } from "./progress-steps";
import { AgentCard } from "./agent-card";
import { CoordinatorCard } from "./coordinator-card";

export function AnalysisShell() {
  const t = useTranslations("pages.ai");
  const locale = useLocale();
  // 选中的分析师
  const [selected, setSelected] = useState<AgentPersona[]>([]);
  // 步骤动画是纯 UI 状态，保留为 useState
  const [currentStep, setCurrentStep] = useState<
    "fetching" | "agent1" | "agent2" | "coordinator" | "done" | null
  >(null);
  const [symbol, setSymbol] = useState("");

  const mutation = useMutation({
    mutationFn: async ({
      inputSymbol,
      personas,
    }: {
      inputSymbol: string;
      personas: AgentPersona[];
    }) => {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: inputSymbol, personas, locale }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      return res.json() as Promise<AnalysisResult>;
    },
    onError: () => {
      toast.error(t("fetchError"));
      setCurrentStep(null);
    },
  });

  const handleAnalyze = async (inputSymbol: string) => {
    setSymbol(inputSymbol);
    setCurrentStep("fetching");

    // 模拟获取数据阶段
    await new Promise((r) => setTimeout(r, 1000));
    setCurrentStep("agent1");

    // 模拟 Agent1 分析阶段
    await new Promise((r) => setTimeout(r, 1000));
    setCurrentStep("agent2");

    // 真正的 API 调用
    const data = await mutation.mutateAsync({
      inputSymbol,
      personas: selected,
    });
    if (!data) return;

    // API 返回后进入 coordinator 阶段
    setCurrentStep("coordinator");
    await new Promise((r) => setTimeout(r, 800));
    setCurrentStep("done");
  };

  const result = mutation.data ?? null;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <Brain className="h-4 w-4 text-blue-500" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-10.5">{t("subtitle")}</p>
      </div>

      {/* 分析师选择器 */}
      <AgentSelector
        selected={selected}
        onChange={setSelected}
        disabled={false}
      />

      {/* 搜索栏 */}
      <SearchBar
        onAnalyze={handleAnalyze}
        isLoading={mutation.isPending}
        disabled={selected.length < 1}
      />

      {/* 进度条 */}
      <ProgressSteps currentStep={currentStep} personas={selected} />

      {mutation.isPending && (
        <p className="text-sm text-muted-foreground">{t("analyzing")}</p>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-xs font-medium tracking-widest text-muted-foreground">
            {t("results")} — {symbol}
          </p>
          {/* 分析结果 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.agentResults.map((agent) => (
              <AgentCard
                key={agent.persona}
                persona={agent.persona}
                points={agent.points}
                score={agent.score}
                verdict={agent.verdict}
                buyRange={agent.buyRange}
              />
            ))}
          </div>

          {/* 总结结果卡片 */}
          {result.coordinator && (
            <CoordinatorCard
              verdict={result.coordinator.verdict}
              score={result.coordinator.score}
              summary={result.coordinator.summary}
              buyRange={result.coordinator.buyRange}
            />
          )}
        </div>
      )}
    </div>
  );
}
