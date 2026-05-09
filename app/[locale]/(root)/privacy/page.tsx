import { getTranslations } from "next-intl/server";
import { NavBar } from "@/features/hero/components/nav-bar";
import { FooterSection } from "@/features/hero/components/footer-section";

const sectionKeys = [
  "collection",
  "usage",
  "thirdParty",
  "security",
  "retention",
  "rights",
  "changes",
  "contact",
] as const;

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <main>
      <NavBar />
      <section
        className="min-h-screen bg-background px-6 py-16"
        style={{
          backgroundImage: `radial-gradient(circle, color-mix(in oklch, var(--primary) 20%, transparent) 1px, transparent 1px)`,
          backgroundSize: `24px 24px`,
        }}
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            {t("lastUpdated")}
          </p>
          <div className="space-y-8">
            {sectionKeys.map((key) => (
              <div key={key}>
                <h2 className="text-xl font-bold text-foreground mb-3">
                  {t(`sections.${key}.title`)}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`sections.${key}.content`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FooterSection />
    </main>
  );
}
