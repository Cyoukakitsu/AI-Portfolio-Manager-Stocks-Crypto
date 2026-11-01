// 隐私政策、使用条款共用的页面：标题、更新日期，以及按 sectionKeys 顺序排列的章节
import { getTranslations } from "next-intl/server";
import { NavBar } from "./nav-bar";
import { FooterSection } from "./footer-section";

export async function LegalDocument({
  namespace,
  sectionKeys,
}: {
  namespace: "privacy" | "terms";
  sectionKeys: readonly string[];
}) {
  const t = await getTranslations(namespace);

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
