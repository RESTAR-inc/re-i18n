import * as csv from "csv";
import fs from "fs";
import path from "path";
import type { I18nConfig } from "../types";

export function csvExport(config: I18nConfig) {
  // const entries = getRawData(config);
  // const exportData: I18nRawDataOLD = {
  //   entries,
  //   meta: {
  //     datetime: new Date().toUTCString(),
  //   },
  // };
  // const outDirPath = path.resolve(config.csv.outDir);
  // console.log(`Writing CSV files to ${outDirPath}`);
  // if (!fs.existsSync(outDirPath)) {
  //   fs.mkdirSync(outDirPath, { recursive: true });
  // }
  // for (const lang of config.langs) {
  //   const csvData: string[][] = [["key", "translation", "comment", "file"]];
  //   for (const entryData of Object.values(exportData.entries)) {
  //     for (const [key, meta] of Object.entries(entryData)) {
  //       csvData.push([
  //         key,
  //         meta.translations[lang],
  //         meta.comment || "",
  //         meta.file,
  //       ]);
  //     }
  //   }
  //   const outFilePath = path.resolve(config.csv.outDir, `${lang}.csv`);
  //   csv.stringify(
  //     csvData,
  //     {
  //       delimiter: config.csv.delimiter,
  //     },
  //     (err, output) => {
  //       if (err) {
  //         throw err;
  //       }
  //       fs.writeFileSync(outFilePath, output, {
  //         encoding: "utf8",
  //       });
  //     }
  //   );
  // }
}
