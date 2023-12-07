import type { I18nTemplateData } from "../schemas/template";
import type { I18nConfig } from "../types";
import { render as renderVanilla } from "./vanilla.js";
import { render as renderVue } from "./vue.js";

export function createTemplateData(config: I18nConfig): I18nTemplateData {
  return {
    appType: config.appType,
    formatterPath: config.generate.formatterPath,
    getLangPath: config.generate.getLangPath,
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
