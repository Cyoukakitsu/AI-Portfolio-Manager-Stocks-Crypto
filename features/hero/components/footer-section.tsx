import { getTranslations } from "next-intl/server";

export async function FooterSection() {
  const t = await getTranslations("hero.footer");

  return (
    <footer className="bg-[#f5f0e8] border-t border-[#c9a84c]/20 py-6 px-6">
      <div className="pt-6 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {t("brand")} |{" "}
        <a href="#" className="hover:text-[#c9a84c] transition-colors">
          {t("terms")}
        </a>{" "}
        |{" "}
        <a href="#" className="hover:text-[#c9a84c] transition-colors">
          {t("privacy")}
        </a>
      </div>
    </footer>
  );
}
