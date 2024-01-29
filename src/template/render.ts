import nunjucks from "nunjucks";
import path from "path";
import type { I18nConfig } from "../schemas/config.js";
import type { I18nTemplateData } from "../schemas/template.js";
import { TEMPLATE as TEMPLATE_VANILLA } from "./templateVanilla.js";
import { TEMPLATE as TEMPLATE_VUE } from "./templateVue.js";

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
    locales: config.locales,
    appType: config.appType,
    funcName: config.funcName,
    componentName: config.componentName,
    composableName: config.composableName,
    localeLocatorPath: normalizePath(config.generate.localeLocatorPath, dir),
    formatterPath: normalizePath(config.generate.formatterPath, dir),
  };
}

function renderTemplate(data: I18nTemplateData) {
  let template: string;
  if (data.appType === "vanilla") {
    template = TEMPLATE_VANILLA;
  } else if (data.appType === "vue") {
    template = TEMPLATE_VUE;
  } else {
    throw new Error(`Unknown appType: ${data.appType}`);
  }

  nunjucks.configure({ autoescape: false });
  return nunjucks.renderString(template, data);
}

export function render(config: I18nConfig, dir: string): string {
  const data = createTemplateData(config, dir);

  return renderTemplate(data);
}
