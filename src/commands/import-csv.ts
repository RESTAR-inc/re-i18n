import chalk from "chalk";
import * as csv from "csv";
import fs from "fs";
import path from "path";
import { sortKeyset } from "../common.js";
import { parse } from "../parser.js";
import type { I18nConfig, I18nKeyset, I18nRawDataKeys } from "../types.js";

function parseFile(
  target: Record<string, I18nRawDataKeys>,
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

      for (const [key, translation, note, commentsStr, filesStr] of rows) {
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

        if (note) {
          const message = [
            chalk.yellow("A note from the translator was found"),
            `  key:\n\t${chalk.bold(key)}`,
            `  location:\n${chalk.bold(files.map((f) => `\t${f}`).join("\n"))}`,
            `  note:\n\t${chalk.bold(note)}`,
          ].join("\n");

          console.log(`${message}\n`);
        }
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

  const parsed: Record<string, I18nRawDataKeys> = {};

  const promises = config.locales.map((lang) => {
    return parseFile(parsed, lang, csvFiles, config);
  });

  try {
    await Promise.all(promises);
  } catch (error) {
    console.log(chalk.red(error instanceof Error ? error.message : error));
    return;
  }

  const dataToImport: Record<string, I18nRawDataKeys> = {};

  parse({
    config,
    onEntry(file, lang, key, translation, comment) {
      const dirName = path.dirname(file);
      if (!dataToImport[dirName]) {
        dataToImport[dirName] = {};
      }

      if (!dataToImport[dirName][key]) {
        dataToImport[dirName][key] = {
          files: [],
          locales: {},
        };
      }
      dataToImport[dirName][key].files.push({ file, comment });

      const csvTranslation = parsed[dirName][key]?.locales[lang];
      dataToImport[dirName][key].locales[lang] = csvTranslation || translation;
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

      for (const [key, keyData] of Object.entries(rawData)) {
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
