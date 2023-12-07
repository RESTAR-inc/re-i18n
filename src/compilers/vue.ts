import * as compiler from "@vue/compiler-sfc";
import { CompilerError } from "../error.js";
import type { I18nCompiler } from "../types";

export class VueCompiler implements I18nCompiler {
  constructor(public fileName: string) {}

  match(ext: string): boolean {
    return ext === ".vue";
  }

  compile(code: string): string {
    const parsed = compiler.parse(code, {});
    const result = [];

    try {
      const { content } = compiler.compileScript(parsed.descriptor, {
        id: "script",
      });
      result.push(content);
    } catch (error) {
      throw new CompilerError(
        `unable to parse "${this.fileName}" script: ${
          error instanceof Error ? error.message : error
        }`
      );
    }

    try {
      const { code } = compiler.compileTemplate({
        id: "template",
        source: parsed.descriptor.template?.content || "",
        filename: "template",
      });
      result.push(code);
    } catch (error) {
      throw new CompilerError(
        `unable to parse "${this.fileName}" template: ${
          error instanceof Error ? error.message : error
        }`
      );
    }

    return result.join(";");
  }
}
