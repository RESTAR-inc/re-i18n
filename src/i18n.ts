import type { I18nFormatter, I18nGetLang, I18nLocales, I18nParams } from "./types";

export function createI18n<L extends string, T extends string>(
  locales: I18nLocales<L, T>,
  formatter: I18nFormatter,
  getLang: I18nGetLang<L>
) {
  const resolve = (key: T): string => {
    const lang = getLang();
    if (!lang) {
      throw new Error("Invalid locale");
    }

    const keyset = locales[lang];
    if (!keyset) {
      throw new Error("Invalid keyset");
    }
    if (keyset[key] == null) {
      return "";
    }

    return keyset[key] || key;
  };

  function wrapper<P extends Record<string, I18nParams>>(key: T, params?: P): string {
    const message = resolve(key);
    return formatter.str(message, params);
  }

  return wrapper;
}
