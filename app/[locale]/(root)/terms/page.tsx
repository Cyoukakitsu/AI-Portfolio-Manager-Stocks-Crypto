import { getTranslations } from "next-intl/server";
import { NavBar } from "@/features/hero/components/nav-bar";
import { FooterSection } from "@/features/hero/components/footer-section";

const sectionKeys = [
  "acceptance",
  "description",
  "accounts",
  "acceptableUse",
  "financialDisclaimer",
  "thirdParty",
  "warranties",
  "liability",
  "changes",
  "contact",
] as const;

export default async function TermsPage() {
  const t = await getTranslations("terms");

  return (
    <main>
      <NavBar />
      <section className="bg-dots min-h-screen bg-background px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="mb-2 text-3xl font-semibold tracking-[-0.8px] text-strong">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            {t("lastUpdated")}
          </p>
          <div className="space-y-8">
            {sectionKeys.map((key) => (
              <div key={key}>
                <h2 className="mb-3 text-xl font-semibold tracking-[-0.4px] text-strong">
                  {t(`sections.${key}.title`)}
                </h2>
                <p className="text-sm leading-relaxed text-foreground">
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
