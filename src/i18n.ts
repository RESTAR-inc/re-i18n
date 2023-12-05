import type {
  I18nFormatter,
  I18nGetLang,
  I18nLangSet,
  I18nParams,
} from "./types";

export function createI18n<L extends string, T extends string>(
  langSet: I18nLangSet<L, T>,
  formatter: I18nFormatter,
  getLang: I18nGetLang<L>
) {
  const resolve = (key: T): string => {
    const lang = getLang();
    if (!lang) {
      throw new Error("Invalid locale");
    }

    const keyset = langSet[lang];
    if (!keyset) {
      throw new Error("Invalid keyset");
    }
    if (keyset[key] == null) {
      return "";
    }

    return keyset[key] || key;
  };

  function wrapper<P extends Record<string, I18nParams>>(
    key: T,
    params?: P
  ): string {
    const message = resolve(key);
    return formatter.str(message, params);
  }

  return wrapper;
}
