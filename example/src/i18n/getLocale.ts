import type { I18nGetLocale } from "@restar-inc/re-i18n";
import type { Locale } from "./types";

const getLocale: I18nGetLocale<Locale> = (locales, defaultLocale) => {
  const locale = navigator.language.split(/-|_/)[0] as Locale;

  if (locales.includes(locale)) {
    return locale;
  }

  return defaultLocale;
};

export default getLocale;
