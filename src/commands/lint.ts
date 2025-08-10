import chalk from "chalk";
import path from "path";
import { parse } from "../parser/parse.js";
import type { I18nConfig } from "../schemas/config.js";

export async function lint(config: I18nConfig) {
  const data = parse({ config });

  const errors: Array<{ path: string; key?: string; reason: string }> = [];

  for (const [dir, rawData] of Object.entries(data)) {
    const dataPath = path.resolve(dir);

    for (const key of rawData.stats.added) {
      errors.push({ key, path: dataPath, reason: "A new key was found" });
    }
    for (const key of rawData.stats.unused) {
      errors.push({ key, path: dataPath, reason: "An unused key was found" });
    }

    const hasUnsortedTranslations = config.locales.some((locale) => {
      const keys = Object.keys(rawData.existingTranslations[locale]);
      const sortedKeys = [...keys].sort();

      for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== sortedKeys[i]) {
          return true;
        }
      }
      return false;
    });

    if (hasUnsortedTranslations) {
      errors.push({ path: dataPath, reason: "Unsorted locale files found." });
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.log(chalk.underline(error.path));

      const message =
        error.key == null
          ? error.reason
          : `${error.reason}: "${chalk.bold(chalk.yellow(error.key))}"`;
      console.log(`  ${chalk.red("error")}  ${message}\n`);
    }
    throw new Error("Lint failed");
  }
}
