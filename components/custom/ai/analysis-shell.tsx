"use client";

// AI 分析功能的 “容器 / 外壳组件” ——
//  - 整合全流程的 UI 布局
//  - 整合基础交互逻辑
import { useState } from "react";
import type { AgentPersona } from "@/types/ai";
import { SearchBar } from "./search-bar";
import { AgentSelector } from "./agent-selector";
import { ProgressSteps } from "./progress-steps";
import { AgentCard } from "./agent-card";
import { CoordinatorCard } from "./coordinator-card";
import { VerdictBanner } from "./verdict-banner";

export function AnalysisShell() {
  // 选中的分析师
  const [selected, setSelected] = useState<AgentPersona[]>([]);

  const handleAnalyze = (symbol: string) => {
    console.log("分析：", symbol, selected); // 后面会改成调用 API
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-medium">AI Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select analysts, enter a symbol, and start the analysis
        </p>
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
        isLoading={false}
        disabled={selected.length < 1}
      />

      {/* 进度条 */}
      <ProgressSteps currentStep="agent1" />

      <p className="text-xs font-medium tracking-widest text-muted-foreground">
        RESULTS — AAPL
      </p>

      {/* 分析结果 */}
      <VerdictBanner
        verdict="hold"
        score={65}
        summary="Strong moat but premium valuation limits near-term upside."
      />
      <div className="grid grid-cols-2 gap-4">
        {/* 分析师卡片 */}
        <AgentCard
          persona="buffett"
          points={[
            "Strong economic moat",
            "Abundant free cash flow",
            "Valuation looks stretched",
          ]}
          score={68}
          verdict="hold"
        />
        <AgentCard
          persona="wood"
          points={[
            "AI integration opens massive TAM",
            "Services revenue growing steadily",
            "Disruptive innovation potential",
          ]}
          score={74}
          verdict="buy"
        />
      </div>

      {/* 总结结果卡片 */}
      <CoordinatorCard
        verdict="hold"
        score={65}
        summary="Both analysts acknowledge Apple's moat but diverge on valuation. Overall, the current price offers a mediocre risk/reward — wait for a better entry point."
        keyLevels={{ entry: 230, stopLoss: 210, target: 268 }}
      />
    </div>
  );
}
