import nunjucks from "nunjucks";
import path from "path";
import { TEMPLATE as TEMPLATE_VANILLA } from "./templateVanilla.js";
import { TEMPLATE as TEMPLATE_VUE } from "./templateVue.js";
function normalizePath(value, dir) {
    if (value && !value.startsWith("@")) {
        return path.relative(dir, value);
    }
    return value;
}
function createTemplateData(config, dir) {
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
function renderTemplate(data) {
    let template;
    if (data.appType === "vanilla") {
        template = TEMPLATE_VANILLA;
    }
    else if (data.appType === "vue") {
        template = TEMPLATE_VUE;
    }
    else {
        throw new Error(`Unknown appType: ${data.appType}`);
    }
    nunjucks.configure({ autoescape: false });
    return nunjucks.renderString(template, data);
}
export function render(config, dir) {
    const data = createTemplateData(config, dir);
    return renderTemplate(data);
}
//# sourceMappingURL=render.js.map