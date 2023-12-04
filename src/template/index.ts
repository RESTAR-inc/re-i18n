import type { I18nTemplateData } from "../schemas/template";
import { render as renderVanilla } from "./vanilla.js";
import { render as renderVue } from "./vue.js";

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
