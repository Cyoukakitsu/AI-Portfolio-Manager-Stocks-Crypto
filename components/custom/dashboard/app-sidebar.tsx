"use client";

import * as React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Bitcoin,
  BrainCircuit,
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { SearchForm } from "@/components/custom/dashboard/search-form";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("nav");

  const navMain = [
    {
      title: t("assets"),
      icon: LayoutDashboard,
      items: [{ title: t("personalPortfolio"), url: "/dashboard/assets" }],
    },
    {
      title: t("stocks"),
      icon: TrendingUp,
      items: [{ title: t("marketOverview"), url: "/dashboard/stocks" }],
    },
    {
      title: t("crypto"),
      icon: Bitcoin,
      items: [{ title: t("marketOverview"), url: "/dashboard/crypto" }],
    },
    {
      title: t("aiAnalysis"),
      icon: BrainCircuit,
      items: [{ title: t("multiAgentAnalysis"), url: "/dashboard/ai" }],
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <motion.div
          className="flex items-center gap-2 px-2 py-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" as const }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-sm">AI Portfolio</span>
            <span className="text-xs text-muted-foreground">Manager</span>
          </div>
        </motion.div>
        <SearchForm />
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.35,
              ease: "easeOut" as const,
              delay: 0.05 + i * 0.07,
            }}
          >
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-1.5">
                <section.icon className="h-3.5 w-3.5" />
                {section.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url}>{item.title}</Link>}
                      />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </motion.div>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
