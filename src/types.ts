import type { CallExpression, StringLiteral } from "@babel/types";

export type { I18nConfig } from "./schemas/config";
export type { I18nTemplateData } from "./schemas/template";

export type I18nKeyset<T extends string> = Record<T, string>;

export type I18nLocales<L extends string, T extends string> = Record<
  L,
  I18nKeyset<T>
>;

export interface I18nParams {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Date
    | I18nParams;
}

export interface I18nFormatter {
  str<T extends I18nParams>(msg: string, options?: T): string;
}

export type I18nGetLang<T extends string> = () => T;

export interface I18nCompiler {
  match(ext: string): boolean;
  compile(code: string): string;
}

export interface I18nRawData {
  [fileName: string]: {
    [key: string]: {
      locales: I18nKeyset<string>;
      comment: string;
    };
  };
}

export type I18nFileTraverseHandler = (
  key: string,
  target: StringLiteral,
  node: CallExpression
) => void;
