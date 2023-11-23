import fs from "fs";
import path from "path";
import ejs from "ejs";
import { I18nConfig } from "../config";

export function renderTsFile(data: I18nConfig) {
  const rootDir = path.resolve(__dirname);
  const templatePath = path.resolve(__dirname, "i18n.ejs");

  return ejs.render(fs.readFileSync(templatePath, "utf-8"), data, {
    root: rootDir,
  });
}
