/* eslint-disable */
/* This file was automatically generated by "re-i18n" */
/* DO NOT EDIT THIS FILE OR YOU WILL BE FIRED. Or not, I dunno... */
import { createI18n } from "re-i18n/lib/vendor/vue";
import formatter from "../../../../i18n/formatter";
import useLocaleLocator from "../../../../i18n/useLocateLocator";
import ja from "./ja.json";
import en from "./en.json";

type I18nLocale = "ja" | "en";
type I18nKey = keyof typeof ja & keyof typeof en;

const localeKeyset = { ja, en };
const {
  Component,
  useI18n,
  locale: currentLocale,
} = createI18n<I18nLocale, I18nKey>(localeKeyset, formatter, useLocaleLocator, "ja");
export const t = useI18n();
export const ReI18n = Component;
export const locale = currentLocale;
