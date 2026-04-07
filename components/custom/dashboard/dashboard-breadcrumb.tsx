"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

type NavKey = "assets" | "stocks" | "crypto" | "aiAnalysis";

const PAGE_NAV_KEYS: Record<string, NavKey> = {
  "/dashboard/assets": "assets",
  "/dashboard/stocks": "stocks",
  "/dashboard/crypto": "crypto",
  "/dashboard/ai": "aiAnalysis",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const key = PAGE_NAV_KEYS[pathname];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage className="text-sm font-medium">
            {key ? t(key) : ""}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
