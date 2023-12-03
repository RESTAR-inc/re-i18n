import * as compiler from "@vue/compiler-sfc";
import type { I18nPrecompiler } from "../../types";

export default class VueCompiler implements I18nPrecompiler {
  match(ext: string): boolean {
    return ext === ".vue";
  }

  compile(code: string): string {
    const parsed = compiler.parse(code, {});

    const templateResult = compiler.compileTemplate({
      id: "template",
      source: parsed.descriptor.template?.content || "",
      filename: "template",
    });

    const scriptResult = compiler.compileScript(parsed.descriptor, {
      id: "script",
    });

    return `
    ${templateResult.code};
    ${scriptResult.content};`;
  }
}
