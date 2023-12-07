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

export function generate(config: I18nConfig) {
  parse({
    config,
    onEnter(file) {
      console.log(`${chalk.blue("File parsed:")} ${file}`);
    },
    onError(file, error) {
      console.log(
        chalk.red(error instanceof Error ? error.message : `${error}`)
      );
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
          ].join("\n\n"),
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
          ].join("\n\n"),
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
        const fileData: I18nKeyset<string> = {};
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

        const targetFile = path.join(targetDir, `${lang}.${fileName}.json`);
        fs.writeFileSync(targetFile, `${JSON.stringify(fileData, null, 2)}\n`, {
          encoding: "utf8",
        });
      }

      if (addNewKeys) {
        const formattedList = formatKeyList(rawFileData.newKeys);
        const message = `\nKeys where added\n\n${formattedList}\n`;
        console.log(chalk.green(message));
      }

      if (removeUnusedKeys) {
        const formattedList = formatKeyList(rawFileData.unusedKeys);
        const message = `\nKeys where removed\n\n${formattedList}\n`;
        console.log(chalk.red(message));
      }
    },
  });

  // const translationKeys = new Map<string, Set<string>>();
  // console.log(translationKeys);
  // walkDirs(config.pattern, config.dirExt, (dir) => {
  //   console.log(`Searching in \x1b[33m${dir.path}\x1b[0m`);
  //   const translationKeys = new Set<string>();
  //   walkFiles(dir.path, (file) => {
  //     traverseFile(file, config.funcName, compilers, (key) => {
  //       translationKeys.add(key);
  //     });
  //   });
  //   const addedKeys = new Set<string>();
  //   const unusedKeys: Array<string> = [];
  //   const translations = getTranslationsFor(dir, config.langs);
  //   for (const lang of config.langs) {
  //     const targetLangKeys = Object.keys(translations[lang]);
  //     for (const key of translationKeys) {
  //       if (targetLangKeys.includes(key)) {
  //         continue;
  //       }
  //       translations[lang][key] = "";
  //       addedKeys.add(key);
  //     }
  //     for (const key of Object.keys(translations[lang])) {
  //       if (!translationKeys.has(key)) {
  //         unusedKeys.push(`${lang}.json: ${key}`);
  //       }
  //     }
  //   }
  //   if (addedKeys.size > 0 || unusedKeys.length > 0) {
  //     console.log(`Folder: \x1b[33m${dir.i18nDir}\x1b[0m`);
  //     for (const key of addedKeys) {
  //       console.log(`Added key: ${key}`);
  //     }
  //     for (const key of unusedKeys) {
  //       console.log(`\x1b[31mUnused key\x1b[0m: ${key}`);
  //     }
  //   }
  //   // if (translationKeys.size > 0) {
  //   //   const tpl = render(createTemplateData(config, dir));
  //   //   writeI8nDirectory(
  //   //     dir,
  //   //     config.langs,
  //   //     translations,
  //   //     tpl,
  //   //     config.generate.sortKeys
  //   //   );
  //   // }
  // });
}
