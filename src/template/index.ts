import path from "path";
import type { I18nConfig } from "../schemas/config.js";
import type { I18nTemplateData } from "../schemas/template.js";
import { render as renderVanilla } from "./vanilla.js";
import { render as renderVue } from "./vue.js";

function normalizePath(value: string, dir: string): string;
function normalizePath(value: string | null, dir: string): string | null;
function normalizePath(value: string | null, dir: string) {
  if (value && !value.startsWith("@")) {
    return path.relative(dir, value);
  }

  return value;
}

function createTemplateData(config: I18nConfig, dir: string): I18nTemplateData {
  const localeDirPath = path.join(dir, config.dirName);

  return {
    formatterPath: normalizePath(config.generate.formatterPath, localeDirPath),
    getLangPath: normalizePath(config.generate.getLangPath, localeDirPath),
    appType: config.appType,
    funcName: config.funcName,
    langs: config.langs,
  };
}

export function render(config: I18nConfig, dir: string): string {
  const data = createTemplateData(config, dir);

  switch (config.appType) {
    case "vanilla":
      return renderVanilla(data);

    case "vue":
      return renderVue(data);

    default:
      throw new Error(`Unknown application type: "${config.appType}"`);
  }
}
