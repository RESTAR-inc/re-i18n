import chalk from "chalk";
import * as csv from "csv";
import fs from "fs";
import path from "path";
import { parseCSVFiles } from "../files/csv.js";
import { getNoteKey, getNotesHash } from "../parser/note.js";
import { parse } from "../parser/parse.js";
import type { I18nConfig, I18nCSVColumns, I18nExportData } from "../types.js";

export async function exportCSV(config: I18nConfig) {
  let notesHash: Record<string, string> = {};

  try {
    const parsedCsv = await parseCSVFiles(config);
    notesHash = getNotesHash(parsedCsv);
  } catch (error) {
    console.log(chalk.yellow("No data found in the CSV files"));
  }

  const targetDir = path.resolve(config.csv.outDir);

  if (!fs.existsSync(targetDir)) {
    console.log(`Creating directory at ${chalk.bold(config.csv.outDir)}`);
    fs.mkdirSync(targetDir, { recursive: true });
  }

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

  for (const lang of config.locales) {
    const csvData: Array<I18nCSVColumns> = [];

    for (const entryData of Object.values(exportData.data)) {
      for (const [key, rawData] of Object.entries(entryData)) {
        const files = Object.entries(rawData.files);

        files.sort(([a], [b]) => a.localeCompare(b));

        csvData.push({
          key,
          translation: rawData.locales[lang],
          note: files
            .map(([fileName]) => notesHash[getNoteKey(lang, fileName, key)] || "")
            .join("\n"),
          comment: files.map(([_fileName, { comment }]) => comment).join("\n"),
          file: files.map(([fileName]) => fileName).join("\n"),
        });
      }
    }

    const targetFile = path.join(targetDir, `${lang}.csv`);
    csv.stringify(
      csvData,
      {
        delimiter: config.csv.delimiter,
        quoted: true,
        quoted_empty: true,
        header: true,
        columns: [
          { key: "key", header: "Key (DO NOT EDIT)" },
          { key: "translation", header: "Translation" },
          { key: "note", header: "Note" },
          { key: "comment", header: "Comment (DO NOT EDIT)" },
          { key: "file", header: "File (DO NOT EDIT)" },
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
