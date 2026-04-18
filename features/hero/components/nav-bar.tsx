"use client";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/features/dashboard/components/locale-switcher";
import { ModeToggle } from "@/features/dashboard/components/mode-toggle";

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/30">
      <div className="px-4 h-16 flex items-center">
        {/* Logo */}
        <span className="text-xl font-bold text-primary tracking-wider px-2">
          AIPM
        </span>

        {/* Nav Links (desktop only) — centered */}
        <div className="flex-1 hidden md:flex justify-center items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">
            Features
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            About Developers
          </a>
        </div>

        {/* Right Controls — flush right */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          <LocaleSwitcher />
          <ModeToggle />
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
