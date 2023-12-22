import type { I18nLocaleLocator } from "re-i18n";

type Locale = "ja" | "en";

class LocaleLocator implements I18nLocaleLocator<Locale> {
  constructor(
    public readonly locales: Array<Locale>,
    public readonly defaultLocale: Locale
  ) {}

  getLocale(): Locale {
    const locale = navigator.language.split(/-|_/)[0] as Locale;

    if (this.locales.includes(locale)) {
      return locale;
    }

    return this.defaultLocale;
  }

  setLocale(_locale: Locale) {
    throw new Error("Not implemented");
  }
}

export default LocaleLocator;
