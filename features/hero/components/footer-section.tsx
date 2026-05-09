import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function FooterSection() {
  const t = await getTranslations("hero.footer");

  return (
    <footer className="bg-background border-t border-border py-6 px-6">
      <div className="pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("brand")} |{" "}
        <Link href="/terms" className="hover:text-[#c9a84c] transition-colors">
          {t("terms")}
        </Link>{" "}
        |{" "}
        <Link href="/privacy" className="hover:text-[#c9a84c] transition-colors">
          {t("privacy")}
        </Link>
      </div>
    </footer>
  );
}
