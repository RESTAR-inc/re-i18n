import chalk from "chalk";
import excel from "exceljs";
import fs from "fs";
import path from "path";
import { parseXLSFile } from "../files/xls.js";
import { getNoteKey, getNotesHash } from "../parser/note.js";
import { parse } from "../parser/parse.js";
import type { I18nConfig, I18nExportData } from "../types.js";

export async function exportXLS(config: I18nConfig) {
  let notesHash: Record<string, string> = {};

  try {
    const xlsData = await parseXLSFile(config);
    notesHash = getNotesHash(xlsData);
  } catch (error) {
    console.log(chalk.yellow("No data found in the XLS file"));
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

  const targetDir = path.resolve(config.xls.outDir);
  if (!fs.existsSync(targetDir)) {
    console.log(`Creating directory at ${chalk.bold(config.xls.outDir)}`);
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const workbook = new excel.Workbook();

  for (const lang of config.locales) {
    const sheet = workbook.addWorksheet(lang, {
      views: [
        {
          state: "frozen",
          xSplit: 1,
          ySplit: 1,
        },
      ],
    });

    sheet.columns = [
      { header: "Key (DO NOT EDIT)", key: "key", width: 30, protection: { locked: true } },
      { header: "Translation", key: "translation", width: 30 },
      { header: "Note", key: "note", width: 20 },
      { header: "Comment (DO NOT EDIT)", key: "comment", width: 50, protection: { locked: true } },
      { header: "File (DO NOT EDIT)", key: "file", width: 50, protection: { locked: true } },
    ];

    let rowCount = 2;

    for (const entryData of Object.values(exportData.data)) {
      for (const [key, rawData] of Object.entries(entryData)) {
        const files = Object.entries(rawData.files);
        if (files.length === 0) {
          continue;
        }

        files.sort(([a], [b]) => a.localeCompare(b));

        const [firstFileName, firstfileData] = files[0];
        const firstNote = notesHash[getNoteKey(lang, firstFileName, key)] || "";

        sheet.addRow([key, rawData.locales[lang], firstNote, firstfileData.comment, firstFileName]);

        if (files.length > 1) {
          const rowCountBefore = rowCount;
          for (let i = 1; i < files.length; i++) {
            const [fileName, fileData] = files[i];
            const note = notesHash[getNoteKey(lang, fileName, key)] || "";
            sheet.addRow(["", "", note, fileData.comment, fileName]);
            rowCount += 1;
          }

          sheet.mergeCells(`A${rowCountBefore}:A${rowCount}`); // merge key cells
          sheet.mergeCells(`B${rowCountBefore}:B${rowCount}`); // merge translation cells
        }

        rowCount += 1;
      }
    }
  }

  await workbook.xlsx.writeFile(path.join(targetDir, "i18n.xlsx"));

  console.log(
    `The export file was created at ${chalk.green(
      path.join(config.xls.outDir, path.basename("i18n.xls"))
    )}`
  );
}
