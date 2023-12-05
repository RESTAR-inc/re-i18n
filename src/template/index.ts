import path from "path";
import type { I18nConfig, I18nDirectory } from "../types";
import type { I18nTemplateData } from "../schemas/template";
import { render as renderVanilla } from "./vanilla.js";
import { render as renderVue } from "./vue.js";

export function createTemplateData(
  config: I18nConfig,
  dir: I18nDirectory
): I18nTemplateData {
  return {
    appType: config.appType,
    formatterPath: config.formatterPath
      ? path.relative(dir.i18nDir, config.formatterPath)
      : null,
    getLangPath: path.relative(dir.i18nDir, config.getLangPath),
    funcName: config.funcName,
    langs: config.langs,
  };
}

export function render(data: I18nTemplateData) {
  switch (data.appType) {
    case "vanilla":
      return renderVanilla(data);

    case "vue":
      return renderVue(data);

    default:
      throw new Error(`Unknown application type: "${data.appType}"`);
  }
}
