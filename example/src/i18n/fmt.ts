import { IntlMessageFormat } from "intl-messageformat";
import { I18nFormatter, I18nFormatterStr, formatRaw } from "vue-re-i18n";

import getLang from "./getLang";

const formatStr: I18nFormatterStr = (str, opts) => {
  try {
    const intl = new IntlMessageFormat(str, getLang());
    const formatted = intl.format(opts);

    if (typeof formatted !== "string") {
      return "";
    }

    return formatted;
  } catch (error) {
    return "";
  }
};

const fmt: I18nFormatter = {
  str: formatStr,
  raw: formatRaw,
};

export default fmt;
