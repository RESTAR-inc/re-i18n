import { HEADER_AUTO_GENERATED, HEADER_NO_ESLINT, HEADER_WARNING } from "./constants.js";
export const TEMPLATE = `${HEADER_NO_ESLINT}
${HEADER_AUTO_GENERATED}
${HEADER_WARNING}
{% if formatterPath -%}
import { createI18n } from "re-i18n/lib/vendor/vue";
import formatter from "{{ formatterPath }}";
{% else -%}
import { formatter } from "re-i18n";
import { createI18n } from "re-i18n/lib/vendor/vue";
{% endif -%}

import useLocaleLocator from "{{ localeLocatorPath }}";
{% for locale in locales -%}
import {{ locale }} from "./{{ locale }}.json";
{% endfor %}
type I18nLocale = {% for locale in locales %}"{{ locale }}"{% if not loop.last %} | {% endif %}{% endfor %};
type I18nKey = {% for locale in locales %}keyof typeof {{ locale }}{% if not loop.last %} & {% endif %}{% endfor %};

const localeKeyset = { {% for locale in locales %}{{ locale -}}{% if not loop.last %},{% endif %} {% endfor -%} };
const {
  Component: {{ componentName }}Internal,
  translate: {{ funcName }}Internal,
  useReI18n: {{ composableName }}Internal,
  locale: localeInternal,
} = createI18n<I18nLocale, I18nKey>(localeKeyset, formatter, useLocaleLocator, "{{ defaultLocale }}");

export const {{ funcName }} = {{ funcName }}Internal;
export const {{ composableName }} = {{ composableName }}Internal;
export const {{ componentName }} = {{ componentName }}Internal;
export const locale = localeInternal;
`;
//# sourceMappingURL=templateVue.js.map