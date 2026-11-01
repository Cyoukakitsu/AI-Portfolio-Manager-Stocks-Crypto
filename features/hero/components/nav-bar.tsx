"use client";

// 落地页顶部导航栏：64px 高、实色底、1px 线色底边（无模糊、无色边）
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/features/dashboard/components/locale-switcher";
import { ModeToggle } from "@/features/dashboard/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";

const navLinkClass = "transition-colors hover:text-foreground";

export function NavBar() {
  const t = useTranslations("hero.nav");
  const pathname = usePathname();
  const locale = useLocale();
  const isHeroPage = pathname === "/";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="relative flex h-16 items-center px-4">
        {/* Logo */}
        <Link
          href="/"
          className="px-2 text-xl font-semibold tracking-[-0.4px] text-strong"
        >
          PortfolioX
        </Link>

        {/* Nav Links (desktop only) — truly centered */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm text-muted-foreground md:flex">
          {isHeroPage ? (
            <a href="#features" className={navLinkClass}>
              {t("features")}
            </a>
          ) : (
            <a href={`/${locale}#features`} className={navLinkClass}>
              {t("features")}
            </a>
          )}
          <a
            href="https://github.com/Cyoukakitsu"
            target="_blank"
            rel="noopener noreferrer"
            className={navLinkClass}
          >
            {t("aboutDevelopers")}
          </a>
        </div>

        {/* Mobile Controls */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <LocaleSwitcher />
          <ModeToggle />
        </div>

        {/* Right Controls — flush right */}
        <div className="ml-auto hidden items-center gap-4 md:flex">
          <LocaleSwitcher />
          <ModeToggle />
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("signIn")}
          </Link>
          <Link href="/sign-up" className={buttonVariants()}>
            {t("getStarted")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
