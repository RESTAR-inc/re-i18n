import nunjucks from "nunjucks";
import path from "path";
import type { I18nConfig } from "../schemas/config.js";
import type { I18nTemplateData } from "../schemas/template.js";

function normalizePath(value: string, dir: string): string;
function normalizePath(value: string | null, dir: string): string | null;
function normalizePath(value: string | null, dir: string) {
  if (value && !value.startsWith("@")) {
    return path.relative(dir, value);
  }

  return value;
}

function createTemplateData(config: I18nConfig, dir: string): I18nTemplateData {
  return {
    defaultLocale: config.defaultLocale,
    formatterPath: normalizePath(config.generate.formatterPath, dir),
    getLocalePath: normalizePath(config.generate.getLocalePath, dir),
    funcName: config.funcName,
    locales: config.locales,
  };
}

import { HEADER_AUTO_GENERATED, HEADER_NO_ESLINT, HEADER_WARNING } from "./constants.js";

const template = `${HEADER_NO_ESLINT}
${HEADER_AUTO_GENERATED}
${HEADER_WARNING}
{% if formatterPath -%}
import { createI18n } from "re-i18n";
import formatter from "{{ formatterPath }}";
{% else -%}
import { createI18n, formatter } from "re-i18n";
{% endif -%}
import getLocale from "{{ getLocalePath }}";
{% for locale in locales -%}
import {{ locale }} from "./{{ locale }}.json";
{% endfor %}
type I18nKey = {% for locale in locales %}keyof typeof {{ locale }}{% if not loop.last %} & {% endif %}{% endfor %};

export const {{ funcName }} = createI18n<I18nKey>({ {% for locale in locales %}{{ locale -}}{% if not loop.last %},{% endif %} {% endfor -%} }, formatter, getLocale, "{{ defaultLocale }}");
`;

function renderTemplate(data: I18nTemplateData) {
  nunjucks.configure({ autoescape: false });
  return nunjucks.renderString(template, data);
}

export function render(config: I18nConfig, dir: string): string {
  const data = createTemplateData(config, dir);

  return renderTemplate(data);
}
