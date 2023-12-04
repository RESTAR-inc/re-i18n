import fs from "fs";
import { configSchema, type I18nConfig } from "./schemas/config.js";

export function loadConfig(path: string): I18nConfig {
  const configStr = fs.readFileSync(path, { encoding: "utf8" });
  const configJSON = JSON.parse(configStr);
  return configSchema.parse(configJSON);
}
