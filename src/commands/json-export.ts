import chalk from "chalk";
import fs from "fs";
import path from "path";
import { parse } from "../parser.js";
import type { I18nConfig, I18nExportData } from "../types.js";

export function jsonExport(config: I18nConfig) {
  const data = parse({
    config,
    onEnterFile(file) {
      console.log(`  File ${chalk.blue(file)}`);
    },
    onError(file, err) {
      const message = err instanceof Error ? err.message : `Error parsing "${file}": ${err}`;

      console.log(chalk.red(message));
    },
    onEnterDir(dir) {
      console.log(`Dir ${chalk.cyan.bold(dir)}`);
    },
  });

  const exportData: I18nExportData = {
    createdAt: new Date().toUTCString(),
    data: Object.entries(data).reduce<I18nExportData["data"]>((acc, [dir, rawData]) => {
      acc[dir] = rawData.keys;
      return acc;
    }, {}),
  };

  const targetDir = path.resolve(config.json.outDir);
  const targetFile = path.join(targetDir, "i18n.json");

  if (!fs.existsSync(targetDir)) {
    console.log(`Creating directory at ${chalk.bold(config.json.outDir)}`);
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetFile, JSON.stringify(exportData, null, 2), {
    encoding: "utf8",
  });

  console.log(
    `The export file was created at ${chalk.green(
      path.join(config.json.outDir, path.basename(targetFile))
    )}`
  );
}
