import chalk from "chalk";
import * as csv from "csv";
import fs from "fs";
import path from "path";
import type { I18nConfig, I18nRawData } from "../types.js";

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

  console.log(JSON.stringify(parsed, null, 2));
}
