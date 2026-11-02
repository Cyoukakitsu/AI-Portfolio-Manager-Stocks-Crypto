"use client";

// Dashboard 侧边栏导航
import * as React from "react";
import {
  Brain,
  CurrencyBtc,
  SquaresFour,
  TrendUp,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { SearchForm } from "@/features/dashboard/components/search-form";
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
      icon: SquaresFour,
      items: [{ title: t("personalPortfolio"), url: "/dashboard/assets" }],
    },
    {
      title: t("stocks"),
      icon: TrendUp,
      items: [
        { title: t("marketOverview"), url: "/dashboard/stocks" },
      ],
    },
    {
      title: t("crypto"),
      icon: CurrencyBtc,
      items: [{ title: t("marketOverview"), url: "/dashboard/crypto" }],
    },
    {
      title: t("aiAnalysis"),
      icon: Brain,
      items: [{ title: t("multiAgentAnalysis"), url: "/dashboard/ai" }],
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex size-8 items-center justify-center rounded-md border border-border bg-card">
            <TrendUp weight="light" className="size-4 text-strong" />
          </div>
          <span className="text-sm font-semibold tracking-[-0.2px] text-strong">
            PortfolioX
          </span>
        </div>
        <SearchForm />
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="flex items-center gap-1.5">
              <section.icon weight="light" className="size-3.5" />
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className="rounded-md text-sm"
                      render={<Link href={item.url}>{item.title}</Link>}
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
