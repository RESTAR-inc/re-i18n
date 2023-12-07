import chalk from "chalk";
import * as csv from "csv";
import fs from "fs";
import path from "path";
import { parse } from "../parser.js";
import type { I18nConfig, I18nCSVColumns, I18nExportData } from "../types";

export async function csvExport(config: I18nConfig) {
  const exportData: I18nExportData = {
    createdAt: new Date().toUTCString(),
    data: {},
  };

  await parse({
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
      exportData.data[file] = rawFileData.keys;
    },
  });

  const targetDir = path.resolve(config.csv.outDir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const lang of config.langs) {
    const csvData: Array<I18nCSVColumns> = [];

    for (const [file, entryData] of Object.entries(exportData.data)) {
      for (const [key, { locales, comment }] of Object.entries(entryData)) {
        csvData.push({
          key,
          translation: locales[lang],
          comment,
          file,
        });
      }
    }

    const targetFile = path.join(targetDir, `${lang}.csv`);
    csv.stringify(
      csvData,
      {
        delimiter: config.csv.delimiter,
        header: true,
        columns: [
          { key: "key", header: "Key" },
          { key: "translation", header: "Translation" },
          { key: "comment", header: "Comment" },
          { key: "file", header: "File (do not edit)" },
        ],
      },
      (err, output) => {
        if (err) {
          throw err;
        }
        fs.writeFileSync(targetFile, output, {
          encoding: "utf8",
        });
        console.log(
          `The export file was created at ${chalk.green(
            path.join(config.csv.outDir, path.basename(targetFile))
          )}`
        );
      }
    );
  }
}
