"use client";

// AI 分析流程的整体容器——含步骤状态和结果区域
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { Persona, PersonaAnalysis, CommitteeVerdict } from "@/features/ai/types";
import { SearchBar } from "./search-bar";
import { PersonaSelector } from "./persona-selector";
import { PersonaCard } from "./persona-card";
import { CommitteeVerdictCard } from "./committee-verdict-card";

import { Brain } from "lucide-react";
import { toast } from "sonner";

export function AnalysisShell() {
  const t = useTranslations("pages.ai");
  const locale = useLocale();

  const [selected, setSelected] = useState<Persona[]>([]);
  const [symbol, setSymbol] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [analyses, setAnalyses] = useState<PersonaAnalysis[]>([]);
  const [committee, setCommittee] = useState<CommitteeVerdict | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleAnalyze = async (inputSymbol: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setSymbol(inputSymbol);
    setIsPending(true);
    setAnalyses([]);
    setCommittee(null);

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
            if (currentEvent === "persona1_done" || currentEvent === "persona2_done") {
              setAnalyses((prev) => [...prev, data as PersonaAnalysis]);
            } else if (currentEvent === "committee_done") {
              setCommittee(data as CommitteeVerdict);
            } else if (currentEvent === "error") {
              toast.error(t("fetchError"));
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

      <PersonaSelector
        selected={selected}
        onChange={setSelected}
        disabled={false}
      />

      <SearchBar
        onAnalyze={handleAnalyze}
        isLoading={isPending}
        disabled={selected.length < 1}
      />

      {isPending && analyses.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("analyzing")}</p>
      )}

      {analyses.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <p className="text-xs font-medium tracking-widest text-muted-foreground">
            {t("results")} — {symbol}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.persona}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <PersonaCard
                  persona={analysis.persona}
                  points={analysis.points}
                  score={analysis.score}
                  verdict={analysis.verdict}
                  buyRange={analysis.buyRange}
                />
              </div>
            ))}
          </div>

          {committee && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CommitteeVerdictCard
                verdict={committee.verdict}
                score={committee.score}
                summary={committee.summary}
                buyRange={committee.buyRange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
