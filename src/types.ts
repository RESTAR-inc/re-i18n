export type I18nKeyset<T extends string> = Record<T, string>;

export type I18nRaw<T> = Array<string | number | null | T>;

export type I18nLangSet<T extends string> = Record<string, I18nKeyset<T>>;

export type I18nFormatterStr = (
  msg: string,
  options: Record<string, string | number>
) => string;

export type I18nFormatterRaw = <T>(
  msg: string,
  options: Record<string, string | number | null | T>
) => I18nRaw<T>;

export type I18nFormatter = {
  raw: I18nFormatterRaw;
  str: I18nFormatterStr;
};

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
