"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { AgentPersona } from "@/features/ai/types";
import { PERSONA_META } from "@/features/ai/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AgentDetailModalProps = {
  modalOpen: AgentPersona | null; // 当前打开的是哪个分析师，null 表示关闭
  onClose: () => void;            // 关闭 Modal 的方法
};

export function AgentDetailModal({ modalOpen, onClose }: AgentDetailModalProps) {
  const t = useTranslations("aiAnalyst");
  // 根据 modalOpen 取出当前分析师的详细信息
  const activePersona = modalOpen ? PERSONA_META[modalOpen] : null;

  return (
    <Dialog
      open={modalOpen !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-md">
        {modalOpen && activePersona && (
          <>
            <DialogHeader>
              {/* 头像 + 姓名 + 职称 */}
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-20 aspect-square rounded-xl overflow-hidden ring-2 ring-primary shrink-0
                    bg-linear-to-b ${activePersona.gradientClass}
                    flex items-end justify-center
                  `}
                >
                  {!activePersona.avatarUrl ? (
                    <span className="text-4xl pb-1">{activePersona.emoji}</span>
                  ) : (
                    <Image
                      src={activePersona.avatarUrl}
                      alt={activePersona.name}
                      width={80}
                      height={45}
                      className="w-full h-full object-cover object-bottom"
                    />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">
                    {activePersona.name}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {activePersona.role}
                  </p>
                  {/* 分析风格标签 */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(t.raw(`${modalOpen}.styleTags`) as string[]).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* 投资哲学 */}
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">
                  {t("modal.philosophy")}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`${modalOpen}.philosophy`)}
                </p>
              </div>

              {/* 擅长领域 */}
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">
                  {t("modal.expertise")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(t.raw(`${modalOpen}.expertise`) as string[]).map((item) => (
                    <span
                      key={item}
                      className="text-xs px-3 py-1 rounded-md bg-muted text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* 代表作/成就 */}
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">
                  {t("modal.achievements")}
                </p>
                <ul className="space-y-1.5">
                  {(t.raw(`${modalOpen}.achievements`) as string[]).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 关闭按钮 */}
            <div className="flex justify-end mt-2">
              <Button
                onClick={onClose}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t("modal.close")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
