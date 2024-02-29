import excel from "exceljs";
import fs from "fs";
import path from "path";
import type { I18nConfig, I18nRawDataKeysGroup } from "../types.js";

export async function parseXLSFile(config: I18nConfig): Promise<I18nRawDataKeysGroup> {
  const workbook = new excel.Workbook();

  const targetFile = path.join(config.xls.outDir, "i18n.xlsx");
  if (!fs.existsSync(path.resolve(targetFile))) {
    throw new Error(`File "${targetFile}" does not exist`);
  }

  await workbook.xlsx.readFile(targetFile);

  const xlsParsed: I18nRawDataKeysGroup = {};

  for (const sheet of workbook.worksheets) {
    const lang = sheet.name;

    // start from 2 to skip the header
    // because of the xls format, the column index starts at 1
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      const key = row.getCell(1).text;
      const translation = row.getCell(2).text;
      const note = row.getCell(3).text;
      const comment = row.getCell(4).text;
      const file = row.getCell(5).text;

      if (!key) {
        continue;
      }

      const targetDir = path.dirname(file);

      if (!xlsParsed[targetDir]) {
        xlsParsed[targetDir] = {};
      }
      if (!xlsParsed[targetDir][key]) {
        xlsParsed[targetDir][key] = {
          files: {},
          locales: {},
        };
      }
      if (!xlsParsed[targetDir][key].files[file]) {
        xlsParsed[targetDir][key].files[file] = {
          comment,
          notes: {},
        };
      }

      xlsParsed[targetDir][key].files[file].comment = comment;
      xlsParsed[targetDir][key].files[file].notes[lang] = note;
      xlsParsed[targetDir][key].locales[lang] = translation;
    }
  }

  return xlsParsed;
}
