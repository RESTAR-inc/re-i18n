import path from "path";
import { Command } from "commander";

import {
  getDirectories,
  getFilesList,
  readDirectory,
  writeDirectory,
} from "../parser/files.js";
import { loadConfig } from "../config.js";
import { traverseFile } from "../parser/traverse.js";
import { renderTsFile } from "../template.js";

export function main() {
  const program = new Command();

  program.option(
    "-c, --config <string>",
    "Load config from file",
    "./i18n.config.json"
  );

  program.parse(process.argv);

  const opts = program.opts<{
    config: string;
  }>();

  const config = loadConfig(path.resolve(opts.config));
  const directories = getDirectories(config.pattern, config.dirExt);

  let hasChanges = false;

  for (const dir of directories) {
    const files = getFilesList(dir.path, config.fileExts);

    const i18nKeysHash = new Map<string, true>();
    const i18nKeys: string[] = [];

    for (const file of files) {
      traverseFile(file, config.funcName, (key) => {
        if (!i18nKeysHash.has(key)) {
          i18nKeysHash.set(key, true);
          i18nKeys.push(key);
        }
      });
    }

    const translations = readDirectory(dir, config.langs, config.sort);

    const addedKeys: string[] = [];
    const addedKeysHash = new Map<string, true>();
    const unusedKeys: Array<string> = [];

    for (const lang of config.langs) {
      const targetLangKeys = Object.keys(translations[lang]);

      for (const key of i18nKeys) {
        if (targetLangKeys.includes(key)) {
          continue;
        }

        translations[lang][key] = "";
        if (!addedKeysHash.has(key)) {
          addedKeysHash.set(key, true);
          addedKeys.push(key);
        }
      }
      for (const key of Object.keys(translations[lang])) {
        if (!i18nKeysHash.has(key)) {
          unusedKeys.push(`${lang}.json: ${key}`);
        }
      }
    }

    if (addedKeys.length > 0 || unusedKeys.length > 0) {
      console.log(`Folder: \x1b[33m${dir.i18nDir}\x1b[0m`);
      for (const key of addedKeys) {
        console.log(`Added key: ${key}`);
      }
      for (const key of unusedKeys) {
        console.log(`\x1b[31mUnused key\x1b[0m: ${key}`);
      }
    }

    if (i18nKeys.length > 0) {
      const template = renderTsFile({
        formatterPath: config.formatterPath
          ? path.relative(dir.i18nDir, config.formatterPath)
          : null,
        getLangPath: config.getLangPath
          ? path.relative(dir.i18nDir, config.getLangPath)
          : null,
        funcName: config.funcName,
        langs: config.langs,
        multiple: config.multiple,
      });
      writeDirectory(dir, config.langs, translations, template, config.sort);
    }

    if (addedKeys.length > 0 || unusedKeys.length > 0) {
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    console.log("Nothing changed");
  }
}
