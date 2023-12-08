import nunjucks from "nunjucks";
import type { I18nTemplateData } from "../schemas/template.js";
import { HEADER_AUTO_GENERATED, HEADER_NO_ESLINT, HEADER_WARNING } from "./constants.js";

const template = `${HEADER_NO_ESLINT}
${HEADER_WARNING}
${HEADER_AUTO_GENERATED}
{% if formatterPath -%}
import { createI18n, type I18nLocales } from "re-i18n";

import formatter from "{{ formatterPath }}";
{% else -%}
import { createI18n, formatter, type I18nLocales } from "re-i18n";
{% endif -%}
import getLocale from "{{ getLangPath }}";

{% for lang in langs -%}
import {{ lang }} from "./{{ lang }}.json";
{% endfor %}
type I18nKey = {% for lang in langs %}keyof typeof {{lang}}{% if not loop.last %} & {% endif %}{% endfor %};

const locales: I18nLocales<I18nKey> = {
{% for lang in langs %}  {{ lang -}},
{% endfor -%}
};

export const {{ funcName }} = createI18n<I18nKey>(locales, formatter, getLocale);
`;

export function render(data: I18nTemplateData) {
  return nunjucks.renderString(template, data);
}
