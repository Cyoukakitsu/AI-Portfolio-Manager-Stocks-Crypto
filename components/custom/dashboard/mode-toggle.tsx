"use client";

import { Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors relative overflow-hidden cursor-pointer"
        aria-label="mode Toggle"
      >
        <Sun className="h-4 w-4 scale-100 dark:scale-0 transition-all" />
        <Moon className="absolute h-4 w-4 scale-0 dark:scale-100 transition-all" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        bg-background
        align="end"
        className="rounded-xl p-1.5 min-w-32.5"
      >
        <DropdownMenuGroup>
          {[
            { value: "Crail", label: "Crail", dot: "bg-amber-400" },
            {
              value: "white",
              label: "White",
              dot: "bg-slate-200 border border-slate-300",
            },
            { value: "dark", label: "Dark", dot: "bg-slate-800" },
          ].map(({ value, label, dot }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className="rounded-lg flex items-center gap-2.5 px-2 py-1.5 cursor-pointer"
            >
              <span className={`h-3 w-3 rounded-full shrink-0 ${dot}`} />
              <span className="text-sm flex-1">{label}</span>
              {resolvedTheme === value && (
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
