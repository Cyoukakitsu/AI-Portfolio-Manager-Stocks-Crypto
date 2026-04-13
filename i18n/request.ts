// 参考文档：https://next-intl.dev/docs/routing/setup

import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// 根据语言代码（locale）决定加载哪个翻译文件
// en → messages/en.json（英文）
// ja → messages/ja.json（日文）
const messageLoaders = {
  ja: () => import("../messages/ja.json"),
  en: () => import("../messages/en.json"),
};

// 每次请求时，next-intl 会调用这个函数来获取当前语言和对应的翻译内容
export default getRequestConfig(async ({ requestLocale }) => {
  // 从 URL 中取出语言代码，例如 /en/dashboard → "en"
  let locale = await requestLocale;

  // 如果语言代码不存在或不在支持列表里，就用默认语言
  if (!locale || !routing.locales.includes(locale as "ja" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // 加载对应语言的 JSON 文件，作为翻译内容提供给整个应用
    messages: (await messageLoaders[locale as "ja" | "en"]()).default,
  };
});
