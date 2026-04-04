import Image from "next/image";
import { TrendingUp, ShieldCheck, BotMessageSquare } from "lucide-react";
import AuthLayoutWrapper from "@/components/custom/auth/auth-layout-wrapper";
import { HeaderControls } from "@/components/custom/dashboard/header-controls";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const chartBars = [38, 52, 34, 68, 58, 78, 62, 88, 72, 94, 82, 100];

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("auth.layout");

  const features = [
    { icon: TrendingUp, title: t("tracking.title"), desc: t("tracking.desc") },
    { icon: BotMessageSquare, title: t("ai.title"), desc: t("ai.desc") },
    { icon: ShieldCheck, title: t("security.title"), desc: t("security.desc") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex h-14 shrink-0 items-center justify-end border-b px-4">
        <HeaderControls />
      </header>
      <div className="flex flex-1">
        {/* ── Left branding panel (desktop only) ── */}
        <div className="hidden lg:flex lg:w-[45%] bg-sidebar flex-col justify-between p-12 relative overflow-hidden border-r border-sidebar-border">
          {/* Subtle grid backdrop using primary color */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Ambient glow */}
          <div className="pointer-events-none absolute top-1/4 left-1/3 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />

          {/* Logo */}
          <div className="relative z-10">
            <Link href="/">
              <Image
                src="/header-icon.png"
                alt="AI Portfolio Manager"
                width={160}
                height={36}
                className="h-auto w-auto"
              />
            </Link>
          </div>

          {/* Headline + feature list */}
          <div className="relative z-10 space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-sidebar-foreground leading-tight tracking-tight">
                Your AI-Powered
                <br />
                <span className="text-primary">Portfolio Command Center</span>
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                Monitor stocks, ETFs, and crypto with real-time data and
                AI-generated insights — all from a single dashboard.
              </p>
            </div>

            <div className="space-y-5">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground">
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative mini-chart */}
          <div className="relative z-10">
            <div className="flex items-end gap-1.5 h-14">
              {chartBars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/40"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 tracking-wide uppercase">
              Portfolio Performance
            </p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-10">
          {/* Mobile-only logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Image
                src="/header-icon.png"
                alt="AI Portfolio Manager"
                width={140}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
        </div>
      </div>
    </div>
  );
}
