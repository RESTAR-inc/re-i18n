import type { I18nFormatter, I18nGetLocale, I18nLocaleKeyset, I18nParams } from "./types.js";

export function createI18n<L extends string, K extends string>(
  localeKeyset: I18nLocaleKeyset<L, K>,
  formatter: I18nFormatter<L>,
  getLocale: I18nGetLocale<L>,
  defaultLocale: L
) {
  const locales = Object.keys(localeKeyset) as L[];

  function translator(key: K, params?: I18nParams): string {
    const locale = getLocale(locales, defaultLocale);
    const keyset = localeKeyset[locale];
    if (!keyset) {
      throw new Error(`No locale for "${locale}"`);
    }

    const message = keyset[key] || key;
    return formatter(locale, message, params);
  }

  return translator;
}
