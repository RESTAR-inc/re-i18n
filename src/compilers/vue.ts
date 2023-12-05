import * as compiler from "@vue/compiler-sfc";
import chalk from "chalk";
import type { I18nCompiler } from "../types";

export class VueCompiler implements I18nCompiler {
  match(ext: string): boolean {
    return ext === ".vue";
  }

  compile(code: string): string {
    const parsed = compiler.parse(code, {});

    let scriptResult = "";
    let templateResult = "";

    try {
      scriptResult = compiler.compileScript(parsed.descriptor, {
        id: "script",
      }).content;
    } catch (error) {
      if (error instanceof Error) {
        console.log(
          chalk.red(`Error parsing vue file script: ${error.message}`)
        );
      }
    }

    try {
      templateResult = compiler.compileTemplate({
        id: "template",
        source: parsed.descriptor.template?.content || "",
        filename: "template",
      }).code;
    } catch (error) {
      if (error instanceof Error) {
        console.log(
          chalk.red(`Error parsing vue file template: ${error.message}`)
        );
      }
    }

    return `${templateResult};${scriptResult};`;
  }
}
