"use client";

import { useTheme } from "next-themes";

export function useWidgetColors() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return {
    bg: dark ? "#09090b" : "#ffffff",
    fg: dark ? "#fafafa" : "#09090b",
  };
}
