"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // resolvedTheme 在 SSR / 水合前为 undefined，客户端才有值
  const mounted = resolvedTheme !== undefined;
  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors relative overflow-hidden cursor-pointer"
        aria-label="切换主题"
      >
        {mounted ? (
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ rotate: -45, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 45, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2, ease: "easeOut" as const }}
              >
                <Moon className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 45, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -45, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2, ease: "easeOut" as const }}
              >
                <Sun className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          // SSR fallback — CSS only，无水合问题
          <>
            <Sun className="h-4 w-4 scale-100 dark:scale-0 transition-all" />
            <Moon className="absolute h-4 w-4 scale-0 dark:scale-100 transition-all" />
          </>
        )}
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
