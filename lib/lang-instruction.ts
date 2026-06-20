const LOCALE_NAMES: Record<string, string> = {
  ja: "Japanese",
  en: "English",
};

export function buildLangInstruction(locale?: string): string {
  const lang = LOCALE_NAMES[locale ?? ""] ?? "English";
  return `\n\nIMPORTANT: Write all text content in ${lang}. Numbers and proper nouns (stock symbols, company names) remain in their original form.`;
}
