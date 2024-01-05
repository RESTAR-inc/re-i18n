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
  Component,
  useI18n,
  locale: currentLocale,
} = createI18n<I18nLocale, I18nKey>(localeKeyset, formatter, useLocaleLocator, "{{ defaultLocale }}");
export const {{ funcName }} = useI18n();
export const {{ componentName }} = Component;
export const locale = currentLocale;
`;
//# sourceMappingURL=templateVue.js.map