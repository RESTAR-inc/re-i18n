import type { I18nFormatter } from "@restar-inc/re-i18n";
import { IntlMessageFormat } from "intl-messageformat";
import type { Locale } from "./types";

const fmt: I18nFormatter<Locale> = (locale, str, opts) => {
  try {
    const intl = new IntlMessageFormat(str, locale);
    const formatted = intl.format(opts);

    if (Array.isArray(formatted)) {
      return formatted.map((f) => (f ? f.toString() : "")).join("");
    }

    if (typeof formatted !== "string") {
      return formatted?.toString() ?? "";
    }

    return formatted;
  } catch {
    return "";
  }
};
export default fmt;
