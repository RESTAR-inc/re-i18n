/* eslint-disable */
/* This file was automatically generated by "re-i18n" */
/* DO NOT EDIT THIS FILE OR YOU WILL BE FIRED. Or not, I dunno... */
import { createI18n } from "re-i18n";
import formatter from "../../../../i18n/formatter";
import getLocale from "../../../../i18n/getLocale";
import ja from "./ja.json";
import en from "./en.json";

type I18nKey = keyof typeof ja & keyof typeof en;

export const t = createI18n<I18nKey>({ ja, en }, formatter, getLocale, "ja");
