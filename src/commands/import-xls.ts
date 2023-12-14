import chalk from "chalk";
import excel from "exceljs";
import fs from "fs";
import path from "path";
import { sortKeyset } from "../common.js";
import { parse } from "../parser.js";
import type { I18nConfig, I18nKeyset, I18nRawData } from "../types.js";

export async function importXLS(config: I18nConfig) {
  const workbook = new excel.Workbook();

  const targetFile = path.join(config.xls.outDir, "i18n.xlsx");
  if (!fs.existsSync(path.resolve(targetFile))) {
    console.log(chalk.red(`File ${chalk.bold(targetFile)} does not exist`));
    return;
  }

  try {
    await workbook.xlsx.readFile(targetFile);
  } catch (error) {
    console.log(chalk.red(error instanceof Error ? error.message : error));
    return;
  }

  const parsed: Record<string, I18nRawData["keys"]> = {};

  for (const sheet of workbook.worksheets) {
    const lang = sheet.name;

    // start from 2 to skip the header
    for (let i = 2; i < sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      const key = row.getCell(1).text;
      const translation = row.getCell(2).text;
      const comment = row.getCell(3).text;
      const file = row.getCell(4).text;

      const targetDir = path.dirname(file);
      if (!parsed[targetDir]) {
        parsed[targetDir] = {};
      }
      if (!parsed[targetDir][key]) {
        parsed[targetDir][key] = {
          files: [],
          locales: {},
        };
      }

      parsed[targetDir][key].files.push({ file, comment });
      parsed[targetDir][key].locales[lang] = translation;
    }
  }

  const dataToImport: Record<string, I18nRawData> = {};

  parse({
    config,
    onEntry(file, lang, key, translation, comment) {
      const dirName = path.dirname(file);
      if (!dataToImport[dirName]) {
        dataToImport[dirName] = {
          keys: {},
          stats: {
            all: new Set(),
            added: new Set(),
            unused: new Set(),
          },
        };
      }

      if (!dataToImport[dirName].keys[key]) {
        dataToImport[dirName].keys[key] = {
          files: [],
          locales: {},
        };
      }
      dataToImport[dirName].keys[key].files.push({ file, comment });

      const csvTranslation = parsed[dirName][key]?.locales[lang];
      dataToImport[dirName].keys[key].locales[lang] = csvTranslation || translation;
    },
  });

  for (const [dir, rawData] of Object.entries(dataToImport)) {
    const targetDir = path.resolve(path.join(dir, config.dirName));
    if (!fs.existsSync(targetDir)) {
      console.log(chalk.red(`Directory ${chalk.bold(dir)} does not exist`));
      continue;
    }

    for (const lang of config.locales) {
      let fileData: I18nKeyset<string> = {};

      for (const [key, keyData] of Object.entries(rawData.keys)) {
        fileData[key] = keyData.locales[lang];
      }

      if (config.generate.sortKeys) {
        fileData = sortKeyset(fileData);
      }

      const targetFile = path.join(dir, config.dirName, `${lang}.json`);
      console.log(`Import locale into ${chalk.bold(targetFile)}`);
      fs.writeFileSync(path.resolve(targetFile), JSON.stringify(fileData, null, 2), {
        encoding: "utf8",
      });
    }
  }
}
