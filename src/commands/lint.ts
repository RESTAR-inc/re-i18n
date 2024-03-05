import chalk from "chalk";
import { parse } from "../parser/parse.js";
import type { I18nConfig } from "../schemas/config.js";

export async function lint(config: I18nConfig) {
  const data = parse({ config });

  const addedKeys: Array<string> = [];
  const unusedKeys: Array<string> = [];

  for (const [dir, rawData] of Object.entries(data)) {
    for (const key of rawData.stats.added) {
      addedKeys.push(`${dir}: "${key}"`);
    }
    for (const key of rawData.stats.unused) {
      unusedKeys.push(`${dir}: "${key}"`);
    }
  }

  if (addedKeys.length > 0) {
    console.log(chalk.red("Added keys:"));
    for (const key of addedKeys) {
      console.log(chalk.red(` - ${key}`));
    }
  }

  if (unusedKeys.length > 0) {
    console.log(chalk.red("Unused keys:"));
    for (const key of unusedKeys) {
      console.log(chalk.red(` - ${key}`));
    }
  }

  if (addedKeys.length !== 0 || unusedKeys.length !== 0) {
    throw new Error("Lint failed");
  }
  console.log(chalk.green("No issues found"));
}
