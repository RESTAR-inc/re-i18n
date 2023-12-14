import { IntlMessageFormat } from "intl-messageformat";
import type { I18nFormatter } from "re-i18n";

const fmt: I18nFormatter = {
  str: (locale, str, opts) => {
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
    } catch (error) {
      return "";
    }
  },
};

export default fmt;
