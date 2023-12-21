import type { I18nGetLocale, I18nLocaleKeyset } from "./types.js";

export function resolveLocale<T extends string>(
  localeKeyset: I18nLocaleKeyset<T>,
  getLocale: I18nGetLocale<keyof I18nLocaleKeyset<T>>,
  defaultLocale: string
) {
  const locales = Object.keys(localeKeyset);
  return getLocale(locales, defaultLocale);
}

export function resolveMessage<T extends string>(
  key: T,
  locale: string,
  localeKeyset: I18nLocaleKeyset<T>
): string {
  const keyset = localeKeyset[locale];

  if (!keyset) {
    throw new Error(`No locale for ${locale}`);
  }

  return keyset[key] || key;
}
