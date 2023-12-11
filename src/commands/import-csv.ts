import chalk from "chalk";
import * as csv from "csv";
import fs from "fs";
import path from "path";
import { sortKeyset } from "../common.js";
import { parse } from "../parser.js";
import type { I18nConfig, I18nKeyset, I18nRawData } from "../types.js";

function parseFile(
  target: Record<string, I18nRawData["keys"]>,
  lang: string,
  csvFiles: Record<string, string>,
  config: I18nConfig
) {
  return new Promise<void>((resolve, reject) => {
    const file = csvFiles[lang];
    if (!file) {
      reject(new Error(`File for lang "${lang}" not found`));
    }

    const csvContent = fs.readFileSync(file, { encoding: "utf8" });

    csv.parse(csvContent, { delimiter: config.csv.delimiter }, (err, rows: Array<string[]>) => {
      if (err) {
        reject(err);
      }

      rows.shift(); // remove header

      for (const [key, translation, commentsStr, filesStr] of rows) {
        const files = filesStr.split("\n");
        const comments = commentsStr.split("\n");

        const targetDir = path.dirname(files[0]);
        if (!target[targetDir]) {
          target[targetDir] = {};
        }
        if (!target[targetDir][key]) {
          target[targetDir][key] = {
            files: files.map((file, idx) => ({ file, comment: comments[idx] })),
            locales: {},
          };
        }

        target[targetDir][key].locales[lang] = translation;
      }
      resolve();
    });
  });
}

export async function importCSV(config: I18nConfig) {
  const csvFiles = fs
    .readdirSync(path.resolve(config.csv.inputDir))
    .reduce<Record<string, string>>((acc, file) => {
      const filePath = path.resolve(config.csv.inputDir, file);
      const fileStat = fs.statSync(filePath);

      if (!fileStat.isFile()) {
        return acc;
      }

      if (path.extname(filePath) !== ".csv") {
        return acc;
      }

      const localeName = path.basename(filePath, ".csv");
      acc[localeName] = filePath;

      return acc;
    }, {});

  const parsed: Record<string, I18nRawData["keys"]> = {};

  const promises = config.langs.map((lang) => {
    return parseFile(parsed, lang, csvFiles, config);
  });

  try {
    await Promise.all(promises);
  } catch (error) {
    console.log(chalk.red(error instanceof Error ? error.message : error));
    return;
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

      const csvTranslation = parsed[dirName][key].locales[lang];
      dataToImport[dirName].keys[key].locales[lang] = csvTranslation || translation;
    },
  });

  for (const [dir, rawData] of Object.entries(dataToImport)) {
    const targetDir = path.resolve(path.join(dir, config.dirName));
    if (!fs.existsSync(targetDir)) {
      console.log(chalk.red(`Directory ${chalk.bold(dir)} does not exist`));
    }

    for (const lang of config.langs) {
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
