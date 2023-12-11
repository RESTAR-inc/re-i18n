import chalk from "chalk";
import fs from "fs";
import path from "path";
import prompts from "prompts";
import { sortKeyset } from "../common.js";
import { parse } from "../parser.js";
import type { I18nConfig } from "../schemas/config.js";
import { render } from "../template/index.js";
import type { I18nKeyset } from "../types.js";

function formatKeyList(set: Set<string>) {
  return Array.from(set)
    .map((key) => `\t- ${key}`)
    .join("\n");
}

export async function generate(config: I18nConfig) {
  const data = parse({
    config,
    onEnterDir(dir) {
      console.log(`Dir ${chalk.cyan.bold(dir)}`);
    },
    onEnterFile(file) {
      console.log(`  File ${chalk.blue(file)}`);
    },
    onError(file, err) {
      const message = err instanceof Error ? err.message : `Error parsing "${file}": ${err}`;
      console.log(chalk.red(message));
    },
  });

  for (const [dir, rawData] of Object.entries(data)) {
    let addNewKeys = false;
    let removeUnusedKeys = false;

    if (rawData.stats.added.size > 0) {
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        initial: true,
        message: [
          chalk.yellow(`New keys have been found in ${chalk.cyan.bold(dir)}`),
          formatKeyList(rawData.stats.added),
          "Would you like to add them?`",
        ].join("\n"),
      });
      addNewKeys = Boolean(proceed);
    }

    if (rawData.stats.unused.size > 0) {
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        initial: true,
        message: [
          chalk.red(`Unused keys have been found in ${chalk.cyan.bold(dir)}`),
          formatKeyList(rawData.stats.unused),
          "Do you want to delete them?`",
        ].join("\n"),
      });
      removeUnusedKeys = Boolean(proceed);
    }

    const targetDir = path.resolve(path.join(dir, config.dirName));
    if (!fs.existsSync(targetDir)) {
      console.log(`Creating directory at ${chalk.bold(dir)}`);
      fs.mkdirSync(targetDir, { recursive: true });
    }

    for (const lang of config.langs) {
      let fileData: I18nKeyset<string> = {};

      for (const [key, keyData] of Object.entries(rawData.keys)) {
        if (rawData.stats.added.has(key)) {
          if (addNewKeys) {
            fileData[key] = keyData.locales[lang];
          }
        } else if (rawData.stats.unused.has(key)) {
          if (!removeUnusedKeys) {
            fileData[key] = keyData.locales[lang];
          }
        } else {
          fileData[key] = keyData.locales[lang];
        }
      }

      if (config.generate.sortKeys) {
        fileData = sortKeyset(fileData);
      }

      const targetFile = path.join(dir, config.dirName, `${lang}.json`);
      console.log(`Saving locale file at ${chalk.bold(targetFile)}`);
      fs.writeFileSync(path.resolve(targetFile), JSON.stringify(fileData, null, 2), {
        encoding: "utf8",
      });
    }

    const template = render(config, dir);
    const targetTemplateFile = path.join(dir, config.dirName, "index.ts");

    console.log(`Saving template file at ${chalk.bold(targetTemplateFile)}`);

    fs.writeFileSync(path.resolve(targetTemplateFile), template, {
      encoding: "utf8",
    });
  }
}
