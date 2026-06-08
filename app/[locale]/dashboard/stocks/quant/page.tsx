import { getTranslations } from "next-intl/server";

export default async function QuantInstitutionsPage() {
  const t = await getTranslations("pages.quant");

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-muted-foreground text-lg">{t("underDevelopment")}</p>
    </div>
  );
}
