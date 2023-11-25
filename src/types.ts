export type I18nKeyset<T extends string> = Record<T, string>;

export type I18nLangSet<T extends string> = Record<string, I18nKeyset<T>>;

export interface I18nFormatter {
  raw<T, U>(msg: string, options: T): U;
  str<T>(msg: string, options: T): string;
}

export type I18nGetLang<T extends string> = () => T;

export interface I18nDirectory {
  i18nDir: string;
  path: string;
  name: string;
}

export interface I18nKeysets {
  [lang: string]: {
    [key: string]: string;
  };
}
