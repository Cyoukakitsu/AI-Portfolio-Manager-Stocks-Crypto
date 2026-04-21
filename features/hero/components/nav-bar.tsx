"use client";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/features/dashboard/components/locale-switcher";
import { ModeToggle } from "@/features/dashboard/components/mode-toggle";
import { useTranslations } from "next-intl";

export function NavBar() {
  const t = useTranslations("hero.nav");

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/30">
      <div className="px-4 h-16 flex items-center relative">
        {/* Logo */}
        <span className="text-xl font-bold text-primary tracking-wider px-2">
          AIPM
        </span>

        {/* Nav Links (desktop only) — truly centered */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">
            {t("features")}
          </a>
          <a
            href="https://cyoukakitsu-portfolio.pages.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {t("aboutDevelopers")}
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
            {t("signIn")}
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t("getStarted")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
