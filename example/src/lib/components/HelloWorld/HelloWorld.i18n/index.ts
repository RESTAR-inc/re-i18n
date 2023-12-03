/* eslint-disable */
// Do not edit, use generator to update
import { createI18n, type I18nLangSet } from "vue-re-i18n";

import formatter from "../../../../i18n/formatter";
import getLang from "../../../../i18n/getLang";

import ja from "./ja.json";
import en from "./en.json";

type I18nKey = keyof typeof ja & keyof typeof en;

const keyset: I18nLangSet<I18nKey> = {};

keyset["ja"] = ja;
keyset["en"] = en;

export const t = createI18n<"ja" | "en", I18nKey>(keyset, formatter, getLang);
