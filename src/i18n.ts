import type { I18nFormatter, I18nLocaleKeyset, I18nLocaleLocator, I18nParams } from "./types.js";

export function createI18n<T extends string>(
  localeKeyset: I18nLocaleKeyset<T>,
  formatter: I18nFormatter,
  localeLocator: I18nLocaleLocator<keyof I18nLocaleKeyset<T>>
) {
  function translator(key: T, params?: I18nParams): string {
    const locale = localeLocator.getLocale();
    const keyset = localeKeyset[locale];
    if (!keyset) {
      throw new Error(`No locale for "${locale}"`);
    }
    const message = keyset[key] || key;

    return formatter(locale, message, params);
  }

  return translator;
}
