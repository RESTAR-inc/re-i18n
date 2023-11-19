import { I18nFormatter, I18nGetLang, I18nLangSet } from "./types";

export function i18n<L extends string, T extends string>(
  langSet: I18nLangSet<T>,
  formatter: I18nFormatter,
  getLang: I18nGetLang<L>
) {}
