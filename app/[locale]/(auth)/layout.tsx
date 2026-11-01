import AuthLayoutWrapper from "@/features/auth/components/auth-layout-wrapper";
import { NavBar } from "@/features/hero/components/nav-bar";

import {
  Robot,
  ShieldCheck,
  TrendUp,
} from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("auth.layout");

  const features = [
    { icon: TrendUp, title: t("tracking.title"), desc: t("tracking.desc") },
    { icon: Robot, title: t("ai.title"), desc: t("ai.desc") },
    { icon: ShieldCheck, title: t("security.title"), desc: t("security.desc") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-1">
        {/* ── Left branding panel (desktop only) ── */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between border-r border-border bg-background p-12">
          {/* Wordmark */}
          <Link
            href="/"
            className="w-fit text-xl font-semibold tracking-[-0.4px] text-strong"
          >
            PortfolioX
          </Link>

          {/* Headline + feature list */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-1.5px] text-strong">
                {t("headline")}
                <br />
                <span className="text-muted-foreground">
                  {t("headlineAccent")}
                </span>
              </h1>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>

            <div className="space-y-5">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                    <Icon
                      weight="light"
                      className="size-5 text-muted-foreground"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-10">
          <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
        </div>
      </div>
    </div>
  );
}
