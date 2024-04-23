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

      const keyCell = row.getCell(1);
      const translationCell = row.getCell(2);

      // This could happen if two or more cells are merged and all the cells are empty
      if (keyCell.value == null || translationCell.value == null) {
        continue;
      }

      const noteCell = row.getCell(3);
      const commentCell = row.getCell(4);
      const fileCell = row.getCell(5);

      const key = keyCell.text;
      const translation = translationCell.text;
      const note = noteCell.text;
      const comment = commentCell.text;
      const file = fileCell.text;

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
