export type { I18nConfig } from "./schemas/config.js";
export type { I18nTemplateData } from "./schemas/template.js";

export type I18nKeyset<T extends string> = Record<T, string>;

export type I18nLocales<L extends string, T extends string> = Record<L, I18nKeyset<T>>;

export interface I18nParams {
  [key: string]: string | number | boolean | null | undefined | Date | I18nParams;
}

export interface I18nFormatter {
  str<T extends I18nParams>(msg: string, options?: T): string;
}

export type I18nGetLang<T extends string> = () => T;

export interface I18nCompiler {
  fileName: string;
  match(ext: string): boolean;
  compile(code: string): string;
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
