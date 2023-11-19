import * as compiler from "@vue/compiler-sfc";
import { Precompiler } from "./base";

export default class VueCompiler implements Precompiler {
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
