export declare const TEMPLATE = "/* eslint-disable */\n/* This file was automatically generated by \"re-i18n\" */\n/* DO NOT EDIT THIS FILE OR YOU WILL BE FIRED. Or not, I dunno... */\n{% if formatterPath -%}\nimport { createI18n } from \"re-i18n/lib/vendor/vue\";\nimport formatter from \"{{ formatterPath }}\";\n{% else -%}\nimport { formatter } from \"re-i18n\";\nimport { createI18n } from \"re-i18n/lib/vendor/vue\";\n{% endif -%}\n\nimport useLocaleLocator from \"{{ localeLocatorPath }}\";\n{% for locale in locales -%}\nimport {{ locale }} from \"./{{ locale }}.json\";\n{% endfor %}\ntype I18nLocale = {% for locale in locales %}\"{{ locale }}\"{% if not loop.last %} | {% endif %}{% endfor %};\ntype I18nKey = {% for locale in locales %}keyof typeof {{ locale }}{% if not loop.last %} & {% endif %}{% endfor %};\n\nconst localeKeyset = { {% for locale in locales %}{{ locale -}}{% if not loop.last %},{% endif %} {% endfor -%} };\nconst {\n  Component: {{ componentName }}Internal,\n  translate: {{ funcName }}Internal,\n  useReI18n: {{ composableName }}Internal,\n  locale: localeInternal,\n} = createI18n<I18nLocale, I18nKey>(localeKeyset, formatter, useLocaleLocator, \"{{ defaultLocale }}\");\n\nexport const {{ funcName }} = {{ funcName }}Internal;\nexport const {{ composableName }} = {{ composableName }}Internal;\nexport const {{ componentName }} = {{ componentName }}Internal;\nexport const locale = localeInternal;\n";
//# sourceMappingURL=templateVue.d.ts.map