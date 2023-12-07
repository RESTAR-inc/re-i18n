import chalk from "chalk";
import fs from "fs";
import path from "path";
import prompts from "prompts";
import { parse } from "../parser.js";
import type { I18nConfig } from "../schemas/config.js";
import type { I18nKeyset } from "../types.js";

function formatKeyList(list: Array<string>) {
  return list.map((key) => `\t- ${key}`).join("\n");
}

function sortKeyset(target: I18nKeyset<string>) {
  return Object.keys(target)
    .sort()
    .reduce<I18nKeyset<string>>((acc, key) => {
      acc[key] = target[key];
      return acc;
    }, {});
}

export function generate(config: I18nConfig) {
  parse({
    config,
    onEnter(file) {
      console.log(`Parsing ${chalk.blue(file)}...`);
    },
    onError(file, err) {
      const message =
        err instanceof Error ? err.message : `Error parsing "${file}": ${err}`;

      console.log(chalk.red(message));
    },
    async onData(file, rawFileData) {
      let addNewKeys = false;
      let removeUnusedKeys = false;

      if (rawFileData.newKeys.length > 0) {
        const { proceed } = await prompts({
          type: "confirm",
          name: "proceed",
          initial: true,
          message: [
            chalk.yellow("New keys have been found"),
            formatKeyList(rawFileData.newKeys),
            "Would you like to add them?`",
          ].join("\n"),
        });
        addNewKeys = Boolean(proceed);
      }

      if (rawFileData.unusedKeys.length > 0) {
        const { proceed } = await prompts({
          type: "confirm",
          name: "proceed",
          initial: true,
          message: [
            chalk.red("Unused keys have been found"),
            formatKeyList(rawFileData.unusedKeys),
            "Do you want to delete them?`",
          ].join("\n"),
        });
        removeUnusedKeys = Boolean(proceed);
      }

      const dirName = path.dirname(file);
      const targetDir = path.resolve(path.join(dirName, config.dirName));
      const fileName = path.basename(file, path.extname(file));

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      for (const lang of config.langs) {
        let fileData: I18nKeyset<string> = {};
        for (const [key, keyData] of Object.entries(rawFileData.keys)) {
          if (rawFileData.newKeys.includes(key)) {
            if (addNewKeys) {
              fileData[key] = keyData.locales[lang];
            }
          } else if (rawFileData.unusedKeys.includes(key)) {
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

        const targetFile = path.join(targetDir, `${lang}.${fileName}.json`);
        fs.writeFileSync(targetFile, JSON.stringify(fileData, null, 2), {
          encoding: "utf8",
        });
      }

      if (addNewKeys) {
        const formattedList = formatKeyList(rawFileData.newKeys);
        const message = `Keys where added\n${formattedList}`;
        console.log(chalk.green(message));
      }

      if (removeUnusedKeys) {
        const formattedList = formatKeyList(rawFileData.unusedKeys);
        const message = `Keys where removed\n${formattedList}`;
        console.log(chalk.red(message));
      }
    },
  });
}
