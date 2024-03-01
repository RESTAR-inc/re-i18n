import * as csv from "csv";
import fs from "fs";
import path from "path";
import type { I18nConfig, I18nRawDataKeysGroup } from "../types.js";

export function getCSVFiles(config: I18nConfig) {
  return fs
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
}

export function parseCSVFile(
  target: I18nRawDataKeysGroup,
  lang: string,
  filePath: string,
  config: I18nConfig
) {
  return new Promise<I18nRawDataKeysGroup>((resolve, reject) => {
    let csvContent = "";

    try {
      csvContent = fs.readFileSync(filePath, { encoding: "utf8" });
    } catch {
      reject(new Error(`File for lang "${lang}" not found`));
      return;
    }

    csv.parse(csvContent, { delimiter: config.csv.delimiter }, (err, rows: Array<string[]>) => {
      if (err) {
        reject(err);
        return;
      }

      rows.shift(); // skip header

      for (const [key, translation, notesStr, commentsStr, filesStr] of rows) {
        const fileNames = filesStr.split("\n");
        const comments = commentsStr.split("\n").map((comment) => comment.trim());
        const notes = notesStr.split("\n").map((note) => note.trim());

        const targetDir = path.dirname(fileNames[0]);
        if (!target[targetDir]) {
          target[targetDir] = {};
        }

        if (!target[targetDir][key]) {
          target[targetDir][key] = {
            files: {},
            locales: {},
          };
        }

        for (let i = 0; i < fileNames.length; i++) {
          if (!target[targetDir][key].files[fileNames[i]]) {
            target[targetDir][key].files[fileNames[i]] = {
              comment: "",
              notes: {},
            };
          }
          target[targetDir][key].files[fileNames[i]].comment = comments[i] || "";
          target[targetDir][key].files[fileNames[i]].notes[lang] = notes[i] || "";
        }

        target[targetDir][key].locales[lang] = translation;
      }

      resolve(target);
    });
  });
}

export async function parseCSVFiles(config: I18nConfig): Promise<I18nRawDataKeysGroup> {
  const parsedCsv: I18nRawDataKeysGroup = {};

  const csvFiles = getCSVFiles(config);
  const promises = config.locales.map((lang) =>
    parseCSVFile(parsedCsv, lang, csvFiles[lang], config)
  );

  await Promise.all(promises);

  return parsedCsv;
}
