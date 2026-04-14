"use client";

// 投资分析师选择器组件，最多可同时选择 2 个分析师
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AgentPersona } from "@/features/ai/types";
import { PERSONA_META } from "@/features/ai/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { AgentDetailModal } from "./agent-detail-modal";

type AgentSelectorProps = {
  selected: AgentPersona[]; // 当前已选中的分析师列表
  onChange: (personas: AgentPersona[]) => void; // 选择变更时通知父组件
  disabled: boolean; // 是否禁用（AI 分析进行中时禁用）
};

// 所有可选分析师的 ID，顺序固定
const PERSONA_IDS: AgentPersona[] = [
  "buffett",
  "lynch",
  "wood",
  "burry",
  "dalio",
];

export function AgentSelector({
  selected,
  onChange,
  disabled,
}: AgentSelectorProps) {
  const t = useTranslations("aiAnalyst");

  // 打开的分析师详情弹窗
  const [modalOpen, setModalOpen] = useState<AgentPersona | null>(null);

  // 点击分析师卡片：已选则取消，未选且未满 2 个则添加
  const handleClick = (id: AgentPersona) => {
    if (disabled) return;

    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else if (selected.length < 2) {
      onChange([...selected, id]);
    }
  };

  // 点击分析师卡片问号：打开弹窗
  const openModal = (e: React.MouseEvent, id: AgentPersona) => {
    e.stopPropagation(); //  阻止事件冒泡（事件往上传播），为了防止触发卡片的点击事件
    setModalOpen(id);
  };

  return (
    <TooltipProvider delay={300}>
      <div className="space-y-3">
        {/* 标题栏：显示当前选中数量 */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{t("selectTitle")}</p>
          <p className="text-xs text-muted-foreground">
            {t("selectCount", { count: selected.length })}
          </p>
        </div>

        {/* 分析师卡片网格 */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {PERSONA_IDS.map((id) => {
            const meta = PERSONA_META[id];
            const isSelected = selected.includes(id);
            const isDisabled =
              disabled || (selected.length === 2 && !isSelected);

            return (
              <button
                key={id}
                onClick={() => handleClick(id)}
                disabled={isDisabled}
                className={`
                  relative flex flex-col items-center gap-1.5 rounded-lg p-3 transition-all duration-200 text-left overflow-hidden
                  ${
                    isSelected
                      ? "border-2 border-primary"
                      : "border-2 border-border bg-card hover:border-primary/40"
                  }
                  ${isDisabled && !isSelected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {/* 头像区域（「?」按钮叠加在右上角） */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                  {/* 渐变背景 + 照片 */}
                  <div
                    className={`
                    w-full h-full bg-linear-to-b ${meta.gradientClass}
                    flex items-end justify-center
                  `}
                  >
                    {!meta.avatarUrl ? (
                      <span className="text-3xl pb-1">{meta.emoji}</span>
                    ) : (
                      <Image
                        src={meta.avatarUrl}
                        alt={meta.name}
                        width={320}
                        height={180}
                        className="w-full h-full object-cover object-bottom"
                      />
                    )}
                  </div>

                  {/* 右上角「?」按钮 */}
                  <Tooltip>
                    <TooltipPrimitive.Trigger
                      data-slot="tooltip-trigger"
                      render={<span />}
                      onClick={(e) => openModal(e, id)}
                      className={`
                        absolute top-1.5 right-1.5 z-10
                        w-5 h-5 rounded-full flex items-center justify-center
                        text-[10px] font-bold transition-colors cursor-pointer
                        bg-white text-gray-700 border border-gray-200
                        hover:bg-primary hover:text-primary-foreground hover:border-primary
                      `}
                    >
                      ?
                    </TooltipPrimitive.Trigger>
                    <TooltipContent
                      side="top"
                      className="max-w-50 text-center text-xs"
                    >
                      {t(`${id}.tooltip`)}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* 姓名 + 状态 */}
                <div
                  className={`w-full flex flex-col items-center gap-1 px-1 py-1.5 rounded-b-xl transition-colors
                  ${isSelected ? "bg-primary/10" : ""}
                `}
                >
                  <p className="text-xs font-semibold text-foreground leading-tight text-center">
                    {meta.name}
                  </p>
                  {isSelected ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium leading-tight">
                      ✓ {t("selected")}
                    </span>
                  ) : (
                    <p className="text-[10px] text-muted-foreground text-center leading-tight py-0.5">
                      {t(`${id}.role`)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 分析师详情 Modal */}
      <AgentDetailModal
        modalOpen={modalOpen}
        onClose={() => setModalOpen(null)}
      />
    </TooltipProvider>
  );
}
