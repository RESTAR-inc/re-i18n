export declare const TEMPLATE = "/* eslint-disable */\n/* This file was automatically generated by \"re-i18n\" */\n/* DO NOT EDIT THIS FILE OR YOU WILL BE FIRED. Or not, I dunno... */\n{% if formatterPath -%}\nimport { createI18n } from \"re-i18n\";\nimport formatter from \"{{ formatterPath }}\";\n{% else -%}\nimport { createI18n, formatter } from \"re-i18n\";\n{% endif -%}\n\nimport getLocale from \"{{ localeLocatorPath }}\";\n{% for locale in locales -%}\nimport {{ locale }} from \"./{{ locale }}.json\";\n{% endfor %}\ntype I18nLocale = {% for locale in locales %}\"{{ locale }}\"{% if not loop.last %} | {% endif %}{% endfor %};\ntype I18nKey = {% for locale in locales %}keyof typeof {{ locale }}{% if not loop.last %} & {% endif %}{% endfor %};\n\nconst localeKeyset = { {% for locale in locales %}{{ locale -}}{% if not loop.last %},{% endif %} {% endfor -%} };\n\nexport const {{ funcName }} = createI18n<I18nLocale, I18nKey>(localeKeyset, formatter, getLocale, \"{{ defaultLocale }}\");\n";
//# sourceMappingURL=templateVanilla.d.ts.map