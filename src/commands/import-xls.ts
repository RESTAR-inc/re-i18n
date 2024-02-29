import chalk from "chalk";
import fs from "fs";
import path from "path";
import { sortKeyset } from "../common.js";
import { parseXLSFile } from "../files/xls.js";
import { parse } from "../parser/parse.js";
import type { I18nConfig, I18nKeyset, I18nRawDataKeysGroup } from "../types.js";

async function parseSourceCode(config: I18nConfig) {
  const dataToImport: I18nRawDataKeysGroup = {};

  try {
    const xlsData = await parseXLSFile(config);
    parse({
      config,
      onEntry(file, lang, key, translation, comment) {
        const dirName = path.dirname(file);
        if (!xlsData[dirName]) {
          console.log(
            chalk.yellow(
              `${chalk.bold(dirName)}: no translation found for the key "${chalk.bold(key)}"`
            )
          );
          return;
        }

        if (!dataToImport[dirName]) {
          dataToImport[dirName] = {};
        }

        if (!dataToImport[dirName][key]) {
          dataToImport[dirName][key] = {
            files: {},
            locales: {},
          };
        }
        dataToImport[dirName][key].files[file] = { comment, notes: {} };

        const xlsTranslation = xlsData[dirName][key]?.locales[lang];
        dataToImport[dirName][key].locales[lang] = xlsTranslation || translation;
      },
    });
  } catch (error) {
    console.log(chalk.red(error instanceof Error ? error.message : error));
  }

  return dataToImport;
}

export async function importXLS(config: I18nConfig) {
  const dataToImport = await parseSourceCode(config);
  const entries = Object.entries(dataToImport);
  if (entries.length === 0) {
    console.log(chalk.yellow("No data to import"));
    return;
  }

  for (const [dir, rawData] of entries) {
    const targetDir = path.resolve(path.join(dir, config.dirName));
    if (!fs.existsSync(targetDir)) {
      console.log(chalk.red(`Directory ${chalk.bold(dir)} does not exist`));
      continue;
    }

    for (const lang of config.locales) {
      let fileData: I18nKeyset<string> = {};

      for (const [key, keyData] of Object.entries(rawData)) {
        fileData[key] = keyData.locales[lang];
      }

      if (config.generate.sortKeys) {
        fileData = sortKeyset(fileData);
      }

      const targetFile = path.join(dir, config.dirName, `${lang}.json`);
      console.log(`Import locale into ${chalk.bold(targetFile)}`);
      fs.writeFileSync(path.resolve(targetFile), JSON.stringify(fileData, null, 2) + "\n", {
        encoding: "utf8",
      });
    }
  }
}
