import * as React from "react";
import Link from "next/link";

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

// This is sample data.
const data = {
  navMain: [
    {
      title: "Your assets",
      url: "#",
      items: [
        {
          title: "Personal Portfolio",
          url: "/dashboard/assets",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Stock",
      url: "#",
      items: [
        {
          title: "Stock Market Overview",
          url: "/dashboard/stocks",
        },
        {
          title: "Data Fetching",
          url: "#crypto",
          isActive: true,
        },
      ],
    },
    {
      title: "Cypto",
      url: "#",
      items: [
        {
          title: "Cypto Market Overview",
          url: "/dashboard/crypto",
        },
        {
          title: "Data Fetching",
          url: "#",
          isActive: true,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={item.isActive}
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
