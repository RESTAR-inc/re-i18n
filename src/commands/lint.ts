import chalk from "chalk";
import path from "path";
import { parse } from "../parser/parse.js";
import type { I18nConfig } from "../schemas/config.js";

export async function lint(config: I18nConfig) {
  const data = parse({ config });
  // const prefix = path.resolve(config.srcDir);

  const keys: Array<{ path: string; key: string; reason: string }> = [];

  for (const [dir, rawData] of Object.entries(data)) {
    for (const key of rawData.stats.added) {
      keys.push({ key, path: path.resolve(dir), reason: "A new key was found" });
    }
    for (const key of rawData.stats.unused) {
      keys.push({ key, path: path.resolve(dir), reason: "An unused key was found" });
    }
  }

  if (keys.length > 0) {
    for (const key of keys) {
      console.log(chalk.underline(key.path));
      console.log(
        `  ${chalk.red("error")}  ${key.reason}: "${chalk.bold(chalk.yellow(key.key))}"\n`
      );
    }
    throw new Error("Lint failed");
  }
}
