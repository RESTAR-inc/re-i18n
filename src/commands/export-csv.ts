import chalk from "chalk";
import * as csv from "csv";
import fs from "fs";
import path from "path";
import { parse } from "../parser.js";
import type { I18nConfig, I18nCSVColumns, I18nExportData } from "../types.js";

export function exportCSV(config: I18nConfig) {
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

  const exportData: I18nExportData = {
    createdAt: new Date().toUTCString(),
    data: Object.entries(data).reduce<I18nExportData["data"]>((acc, [dir, rawData]) => {
      acc[dir] = rawData.keys;
      return acc;
    }, {}),
  };

  const targetDir = path.resolve(config.csv.outDir);
  if (!fs.existsSync(targetDir)) {
    console.log(`Creating directory at ${chalk.bold(config.csv.outDir)}`);
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const lang of config.langs) {
    const csvData: Array<I18nCSVColumns> = [];

    for (const entryData of Object.values(exportData.data)) {
      for (const [key, { locales, files }] of Object.entries(entryData)) {
        csvData.push({
          key,
          translation: locales[lang],
          comment: files.map(({ comment }) => comment).join("\n"),
          file: files.map(({ file }) => file).join("\n"),
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
          console.log(`Error exporting csv ${chalk.red(config.json.outDir)}`);
          return;
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
