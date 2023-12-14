import type { I18nFormatter, I18nGetLocale, I18nLocaleKeyset, I18nParams } from "./types.js";

/**
 * Creates an i18n wrapper function.
 * @param localeKeyset - The object containing the i18n locales.
 * @param formatter - The i18n formatter implementation.
 * @param getLocale - The function to get the current locale.
 * @returns The translation function.
 */
export function createI18n<T extends string>(
  localeKeyset: I18nLocaleKeyset<T>,
  formatter: I18nFormatter,
  getLocale: I18nGetLocale<keyof I18nLocaleKeyset<T>>,
  defaultLocale: string
) {
  function wrapper(key: T, params?: I18nParams): string {
    const locales = Object.keys(localeKeyset);
    const locale = getLocale(locales, defaultLocale);
    const keyset = localeKeyset[locale];

    if (!keyset) {
      throw new Error(`No locale for ${locale}`);
    }

    return formatter.str(locale, keyset[key] || key, params);
  }

  return wrapper;
}
