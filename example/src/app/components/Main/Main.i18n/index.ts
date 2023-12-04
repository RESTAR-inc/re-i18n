/* eslint-disable */
// This file is generated by vue-re-i18n, do not edit
import { createI18n, type I18nLangSet } from "vue-re-i18n";

import formatter from "../../../../i18n/formatter";
import getLang from "../../../../i18n/getLang";

import ja from "./ja.json";
import en from "./en.json";

type I18nKey = keyof typeof ja & keyof typeof en;
type I18nLang = "ja" | "en";

const langSet: I18nLangSet<I18nLang, I18nKey> = {
  ja,
  en,
};

export const t = createI18n<I18nLang, I18nKey>(langSet, formatter, getLang);
