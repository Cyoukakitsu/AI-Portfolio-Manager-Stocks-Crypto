"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      {/* Base UI 版：直接在 Trigger 上写样式，不用 asChild */}
      <DropdownMenuTrigger
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors relative"
        aria-label="切换主题"
      >
        {/* 两个图标同时渲染，用 CSS 控制显隐，完全不需要 mounted */}
        <Sun className="h-4 w-4 scale-100 dark:scale-0 transition-all" />
        <Moon className="absolute h-4 w-4 scale-0 dark:scale-100 transition-all" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("default")}>
          default
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("white")}>
          white
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
