"use client";

import { AgentPersona } from "@/types/ai";
import { PERSONA_META } from "@/lib/ai/constants";
import { useTranslations } from "next-intl";

type ProgressStepsProps = {
  currentStep: "fetching" | "agent1" | "agent2" | "coordinator" | "done" | null;
  personas?: AgentPersona[];
};

export function ProgressSteps({ currentStep, personas = [] }: ProgressStepsProps) {
  const t = useTranslations("progressSteps");

  if (!currentStep) return null;

  const STEPS = [
    { id: "fetching", label: t("fetchingData") },
    { id: "agent1", label: personas[0] ? PERSONA_META[personas[0]].name : t("analyst1") },
    { id: "agent2", label: personas[1] ? PERSONA_META[personas[1]].name : t("analyst2") },
    { id: "coordinator", label: t("finalVerdict") },
  ];

  // 当前步骤的索引，done 表示全部完成
  const currentIndex =
    currentStep === "done"
      ? STEPS.length
      : STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              {/* 圆点 */}
              <div
                className={`
                w-5 h-5 rounded-full flex items-center justify-center
                text-xs font-medium shrink-0
                ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "border-2 border-primary text-primary animate-pulse"
                      : "border border-border text-muted-foreground"
                }
              `}
              >
                {isDone ? "✓" : index + 1}
              </div>
              {/* 文字 */}
              <span
                className={`
                text-xs whitespace-nowrap
                ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}
              `}
              >
                {step.label}
              </span>
            </div>
            {/* 连接线 */}
            {index < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 mx-1 transition-colors duration-500 ${isDone ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
