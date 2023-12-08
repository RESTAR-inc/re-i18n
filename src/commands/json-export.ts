import chalk from "chalk";
import fs from "fs";
import path from "path";
import { parse } from "../parser.js";
import type { I18nConfig, I18nExportData } from "../types";

export async function jsonExport(config: I18nConfig) {
  const exportData: I18nExportData = {
    createdAt: new Date().toUTCString(),
    data: {},
  };

  await parse({
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
    async onData(file, rawFileData) {
      // exportData.data[file] = rawFileData.keys;
    },
  });

  // const targetDir = path.resolve(config.json.outDir);
  // const targetFile = path.join(targetDir, "i18n.json");
  // if (!fs.existsSync(targetDir)) {
  //   fs.mkdirSync(targetDir, { recursive: true });
  // }

  // fs.writeFileSync(targetFile, `${JSON.stringify(exportData, null, 2)}\n`, {
  //   encoding: "utf8",
  // });

  // console.log(
  //   `The export file was created at ${chalk.green(
  //     path.join(config.json.outDir, path.basename(targetFile))
  //   )}`
  // );
}
