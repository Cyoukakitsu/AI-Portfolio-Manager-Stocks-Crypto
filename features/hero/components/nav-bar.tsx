"use client";

// 落地页顶部导航栏：64px 高、实色底、1px 线色底边（无模糊、无色边）
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/features/dashboard/components/locale-switcher";
import { ModeToggle } from "@/features/dashboard/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const navLinkClass = "transition-colors hover:text-foreground";

export function NavBar() {
  const t = useTranslations("hero.nav");

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="relative flex h-16 items-center px-4">
        <Link
          href="/"
          className="px-2 text-xl font-semibold tracking-[-0.4px] text-strong"
        >
          PortfolioX
        </Link>

        {/* 导航链接（仅桌面端），相对整条栏居中而不是夹在左右控件之间 */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm text-muted-foreground md:flex">
          {/* 在哪个页面都回到落地页的功能区；Link 会自动加上语言前缀 */}
          <Link href="/#features" className={navLinkClass}>
            {t("features")}
          </Link>
          <a
            href="https://github.com/Cyoukakitsu"
            target="_blank"
            rel="noopener noreferrer"
            className={navLinkClass}
          >
            {t("aboutDevelopers")}
          </a>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <LocaleSwitcher />
          <ModeToggle />
          {/* 登录与注册入口仅桌面端显示（手机宽度下落地页自带 CTA） */}
          <div className="hidden items-center gap-4 md:flex">
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
      </div>
    </nav>
  );
}
