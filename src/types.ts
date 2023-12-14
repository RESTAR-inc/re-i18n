export type { I18nConfig } from "./schemas/config.js";
export type { I18nTemplateData } from "./schemas/template.js";

export type I18nKeyset<T extends string> = Record<T, string>;

export type I18nLocaleKeyset<T extends string> = Record<string, I18nKeyset<T>>;

export type I18nParam = string | number | boolean | null | undefined | Date;

export interface I18nParams {
  [key: string]: I18nParam;
}

export interface I18nFormatter {
  str(locale: string, message: string, options?: I18nParams): string;
}

export type I18nGetLocale<T extends string = string> = (locales: Array<T>, defaultLocale: T) => T;

export interface I18nCompiler {
  fileName: string;
  match(ext: string): boolean;
  compile(code: string): [string, Array<Error>];
}

export interface I18nRawData {
  stats: {
    all: Set<string>;
    added: Set<string>;
    unused: Set<string>;
  };
  keys: {
    [key: string]: {
      locales: I18nKeyset<string>;
      files: Array<{
        file: string;
        comment: string;
      }>;
    };
  };
}

export interface I18nExportData {
  data: {
    [dir: string]: I18nRawData["keys"];
  };
  createdAt: string;
}

export interface I18nCSVColumns {
  key: string;
  translation: string;
  comment: string;
  file: string;
}
