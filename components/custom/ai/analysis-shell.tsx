"use client";

//状态管理
import { useState } from "react";
import { SearchBar } from "./search-bar";
import { AgentSelector } from "./agent-selector";
import { ProgressSteps } from "./progress-steps";
import { AgentCard } from "./agent-card";
import { CoordinatorCard } from "./coordinator-card";
import { VerdictBanner } from "./verdict-banner";

export function AnalysisShell() {
  const [selected, setSelected] = useState<string[]>([]);

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
      <AgentSelector
        selected={selected}
        onChange={setSelected}
        disabled={false}
      />
      <SearchBar
        onAnalyze={handleAnalyze}
        isLoading={false}
        disabled={selected.length < 1}
      />

      <ProgressSteps currentStep="agent1" />

      <p className="text-xs font-medium tracking-widest text-muted-foreground">
        RESULTS — AAPL
      </p>
      <VerdictBanner
        verdict="hold"
        score={65}
        summary="Strong moat but premium valuation limits near-term upside."
      />
      <div className="grid grid-cols-2 gap-4">
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
      <CoordinatorCard
        verdict="hold"
        score={65}
        summary="Both analysts acknowledge Apple's moat but diverge on valuation. Overall, the current price offers a mediocre risk/reward — wait for a better entry point."
        keyLevels={{ entry: 230, stopLoss: 210, target: 268 }}
      />
    </div>
  );
}
