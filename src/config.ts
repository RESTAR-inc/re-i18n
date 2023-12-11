import chalk from "chalk";
import fs from "fs";
import { configSchema, type I18nConfig } from "./schemas/config.js";

export function loadConfig(path: string): I18nConfig | null {
  const configStr = fs.readFileSync(path, { encoding: "utf8" });
  const configJSON = JSON.parse(configStr);
  const config = configSchema.safeParse(configJSON);

  if (config.success) {
    return config.data;
  }

  console.log(chalk.bold.red("Invalid config file\n"));

  for (const issue of config.error.issues) {
    const errorPath = issue.path.join(".");
    console.log(`${chalk.red(`  ${errorPath}`)}: ${issue.message}`);
  }

  return null;
}
