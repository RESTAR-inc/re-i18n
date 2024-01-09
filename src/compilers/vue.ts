import * as compiler from "@vue/compiler-sfc";
import fs from "fs";
import { CompilerError } from "../error.js";
import type { I18nCompiler } from "../types.js";

export class VueCompiler implements I18nCompiler {
  constructor(public fileName: string) {}

  match(ext: string): boolean {
    return ext === ".vue";
  }

  compile(code: string): [string, Array<Error>] {
    const parsed = compiler.parse(code, {
      filename: this.fileName,
    });
    const result = [];
    const errors: Array<Error> = [];

    try {
      const { content } = compiler.compileScript(parsed.descriptor, {
        fs: {
          fileExists: (file: string) => {
            return fs.existsSync(file);
          },
          readFile: (file: string) => {
            return fs.readFileSync(file, "utf-8");
          },
        },
        id: "script",
      });
      result.push(content);
    } catch (error) {
      errors.push(
        new CompilerError(
          `unable to parse "${this.fileName}" script: ${
            error instanceof Error ? error.message : error
          }`
        )
      );
    }

    try {
      const { code } = compiler.compileTemplate({
        id: "template",
        source: parsed.descriptor.template?.content || "",
        filename: "template",
        compilerOptions: {
          inline: true,
        },
      });
      result.push(code);
    } catch (error) {
      errors.push(
        new CompilerError(
          `unable to parse "${this.fileName}" template: ${
            error instanceof Error ? error.message : error
          }`
        )
      );
    }

    return [result.join(";"), errors];
  }
}
