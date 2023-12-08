import type { I18nFormatter, I18nGetLocale, I18nLocales, I18nParams } from "./types.js";

export function createI18n<T extends string>(
  locales: I18nLocales<T>,
  formatter: I18nFormatter,
  getLocale: I18nGetLocale
) {
  function wrapper(key: T, params?: I18nParams): string {
    const localeName = getLocale();
    if (!localeName) {
      throw new Error("No language is set");
    }

    const keyset = locales[localeName];
    if (!keyset) {
      throw new Error(`No locale for ${localeName}`);
    }

    const message = keyset[key] || key;
    return formatter.str(message, params);
  }

  return wrapper;
}
