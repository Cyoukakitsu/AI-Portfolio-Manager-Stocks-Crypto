"use client";

// AI 分析流程的整体容器——含步骤状态和结果区域
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { AgentPersona, AgentResult, CoordinatorResult } from "@/features/ai/types";
import { SearchBar } from "./search-bar";
import { AgentSelector } from "./agent-selector";
import { AgentCard } from "./agent-card";
import { AgentPendingCard } from "./agent-pending-card";
import { CoordinatorCard } from "./coordinator-card";

import { Brain, Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

export function AnalysisShell() {
  const t = useTranslations("pages.ai");
  const locale = useLocale();

  const [selected, setSelected] = useState<AgentPersona[]>([]);
  const [symbol, setSymbol] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [agentResults, setAgentResults] = useState<AgentResult[]>([]);
  const [coordinator, setCoordinator] = useState<CoordinatorResult | null>(null);
  const [running, setRunning] = useState<AgentPersona[]>([]);
  const [steps, setSteps] = useState<Partial<Record<AgentPersona, string>>>({});
  const abortRef = useRef<AbortController | null>(null);

  const handleAnalyze = async (inputSymbol: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setSymbol(inputSymbol);
    setIsPending(true);
    setAgentResults([]);
    setCoordinator(null);
    setRunning(selected);
    setSteps({});

    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: inputSymbol, personas: selected, locale }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) throw new Error("Analysis failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEvent) {
            const data = JSON.parse(line.slice(6));
            if (currentEvent === "agent1_done" || currentEvent === "agent2_done") {
              setAgentResults((prev) => [...prev, data as AgentResult]);
            } else if (currentEvent === "step") {
              setSteps((prev) => ({ ...prev, [data.persona]: data.tool }));
            } else if (currentEvent === "coordinator_done") {
              setCoordinator(data as CoordinatorResult);
            } else if (currentEvent === "error") {
              toast.error(data.message ?? t("fetchError"));
            }
            currentEvent = "";
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        toast.error(t("fetchError"));
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-10.5">{t("subtitle")}</p>
      </div>

      <AgentSelector
        selected={selected}
        onChange={setSelected}
        disabled={false}
      />

      <SearchBar
        onAnalyze={handleAnalyze}
        isLoading={isPending}
        disabled={selected.length < 1}
      />

      {(isPending || agentResults.length > 0) && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <p className="text-xs font-medium tracking-widest text-muted-foreground">
            {t("results")} — {symbol}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agentResults.map((agent) => (
              <div
                key={agent.persona}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <AgentCard
                  persona={agent.persona}
                  points={agent.points}
                  score={agent.score}
                  verdict={agent.verdict}
                  buyRange={agent.buyRange}
                />
              </div>
            ))}
            {isPending &&
              running
                .filter((p) => !agentResults.some((r) => r.persona === p))
                .map((p) => (
                  <AgentPendingCard key={p} persona={p} tool={steps[p]} />
                ))}
          </div>

          {isPending && !coordinator && running.length === 2 && agentResults.length === 2 && (
            <Card className="animate-in fade-in duration-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t("coordinatorName")}</p>
                    <p className="text-xs text-muted-foreground">{t("coordinatorPending")}</p>
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          )}

          {coordinator && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CoordinatorCard
                verdict={coordinator.verdict}
                score={coordinator.score}
                summary={coordinator.summary}
                buyRange={coordinator.buyRange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
