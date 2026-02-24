import * as React from "react";
import Link from "next/link";
import { LayoutDashboard, TrendingUp, Bitcoin } from "lucide-react";

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

const data = {
  navMain: [
    {
      title: "Your Assets",
      icon: LayoutDashboard,
      url: "#",
      items: [
        {
          title: "Personal Portfolio",
          url: "/dashboard/assets",
        },
      ],
    },
    {
      title: "Stocks",
      icon: TrendingUp,
      url: "#",
      items: [
        {
          title: "Market Overview",
          url: "/dashboard/stocks",
        },
      ],
    },
    {
      title: "Crypto",
      icon: Bitcoin,
      url: "#",
      items: [
        {
          title: "Market Overview",
          url: "/dashboard/crypto",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-sm">AI Portfolio</span>
            <span className="text-xs text-muted-foreground">Manager</span>
          </div>
        </div>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((section) => (
          <SidebarGroup key={section.title}>
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
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
