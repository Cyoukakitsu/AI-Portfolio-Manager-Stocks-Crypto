import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

const messageLoaders = {
  ja: () => import("../messages/ja.json"),
  en: () => import("../messages/en.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "ja" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await messageLoaders[locale as "ja" | "en"]()).default,
  };
});
