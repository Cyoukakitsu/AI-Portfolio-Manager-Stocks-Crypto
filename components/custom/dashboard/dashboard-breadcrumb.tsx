"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/assets": "Assets",
  "/dashboard/stocks": "Stocks",
  "/dashboard/crypto": "Crypto",
  "/dashboard/aichatbot": "AI Chatbot",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const label = PAGE_LABELS[pathname] ?? "Dashboard";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage className="text-sm font-medium">
            {label}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
