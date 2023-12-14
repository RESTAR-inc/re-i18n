import type { I18nGetLocale } from "re-i18n";

const getLocale: I18nGetLocale = (locales, defaultLocale) => {
  const locale = navigator.language.split(/-|_/)[0];

  if (locales.includes(locale)) {
    return locale;
  }

  return defaultLocale;
};

export default getLocale;
