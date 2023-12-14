import chalk from "chalk";
import fs from "fs";
import path from "path";
import prompts from "prompts";
import { sortKeyset } from "../common.js";
import { parse } from "../parser.js";
import type { I18nConfig } from "../schemas/config.js";
import { render } from "../template/render.js";
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

  const localesToCreate: Record<string, { [file: string]: string }> = {};
  const localesToDelete = new Set<string>();

  for (const [dir, rawData] of Object.entries(data)) {
    let addNewKeys = false;
    let removeUnusedKeys = false;

    if (rawData.stats.added.size > 0) {
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        initial: true,
        message: [
          chalk.yellow("New keys have been found in"),
          chalk.blue(dir),
          "\n",
          formatKeyList(rawData.stats.added),
          "\n",
          chalk.blue("Would you like to add them?"),
        ].join(" "),
      });
      addNewKeys = Boolean(proceed);
    }

    if (rawData.stats.unused.size > 0) {
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        initial: true,
        message: [
          chalk.yellow("Unused keys have been found in"),
          chalk.red(dir),
          "\n",
          formatKeyList(rawData.stats.unused),
          "\n",
          chalk.red("Do you want to delete them?"),
        ].join(" "),
      });
      removeUnusedKeys = Boolean(proceed);
    }

    const localeDir = path.join(dir, config.dirName);

    for (const lang of config.locales) {
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

      if (Object.keys(fileData).length === 0) {
        if (fs.existsSync(path.resolve(localeDir))) {
          localesToDelete.add(localeDir);
          continue;
        }
      } else {
        if (config.generate.sortKeys) {
          fileData = sortKeyset(fileData);
        }

        if (!localesToCreate[localeDir]) {
          localesToCreate[localeDir] = {};
        }
        const targetFile = path.join(dir, config.dirName, `${lang}.json`);
        localesToCreate[localeDir][targetFile] = JSON.stringify(fileData, null, 2);
      }
    }
  }

  for (const dirToDelete of localesToDelete) {
    const { proceed } = await prompts({
      type: "confirm",
      name: "proceed",
      initial: true,
      message: [
        chalk.yellow("Unused locale have been found in"),
        chalk.red(dirToDelete),
        "\n",
        chalk.red("Do you want to delete it?"),
      ].join(" "),
    });

    if (proceed) {
      fs.rmSync(dirToDelete, { recursive: true });
    }
  }

  for (const [dir, files] of Object.entries(localesToCreate)) {
    const targetDir = path.resolve(dir);

    if (!fs.existsSync(targetDir)) {
      console.log(`Creating directory at ${chalk.bold(dir)}`);
      fs.mkdirSync(targetDir, { recursive: true });
    }

    for (const [file, content] of Object.entries(files)) {
      console.log(`Saving locale file at ${chalk.bold(file)}`);
      fs.writeFileSync(path.resolve(file), content, { encoding: "utf8" });
    }

    const template = render(config, dir);
    const targetTemplateFile = path.join(dir, "index.ts");

    console.log(`Saving template file at ${chalk.bold(targetTemplateFile)}`);

    fs.writeFileSync(path.resolve(targetTemplateFile), template, { encoding: "utf8" });
  }
}
