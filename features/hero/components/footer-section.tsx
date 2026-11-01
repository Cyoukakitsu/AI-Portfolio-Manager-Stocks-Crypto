// 落地页底部 Footer
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const footerLinkClass = "transition-colors hover:text-foreground";

export async function FooterSection() {
  const t = await getTranslations("hero.footer");

  return (
    <footer className="border-t border-border bg-background px-6 py-8">
      <div className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("brand")} |{" "}
        <Link href="/terms" className={footerLinkClass}>
          {t("terms")}
        </Link>{" "}
        |{" "}
        <Link href="/privacy" className={footerLinkClass}>
          {t("privacy")}
        </Link>
      </div>
    </footer>
  );
}
