import path from "path";

import { Command } from "commander";
import {
  getDirectories,
  getFilesList,
  readDirectory,
  writeDirectory,
} from "../parser/files";
import { loadConfig } from "../config";
import { traverseFile } from "../parser/traverse";
import { renderTsFile } from "../template";

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
  const directories = getDirectories(config.path, config.dirExt);

  let hasChanges = false;

  const template = renderTsFile(config);

  for (const dir of directories) {
    const files = getFilesList(dir.path, config.fileExts);

    const i18nKeysHash = new Map<string, true>();
    const i18nKeys: string[] = [];

    for (const file of files) {
      traverseFile(file, config.func, (key) => {
        if (!i18nKeysHash.has(key)) {
          i18nKeysHash.set(key, true);
          i18nKeys.push(key);
        }
      });
    }

    const translations = readDirectory(dir, config.langs, config.sort);
    if (i18nKeys.length > 0) {
      writeDirectory(dir, config.langs, translations, template, config.sort);
    }

    const addedKeys: string[] = [];
    const addedKeysHash = new Map<string, true>();
    const unusedKeys: Array<string> = [];

    for (const lang of config.langs) {
      const targetLang = translations[lang];
      const targetLangKeys = Object.keys(targetLang);

      for (const key of i18nKeys) {
        if (targetLangKeys.includes(key)) {
          continue;
        }

        targetLang[key] = "";

        if (!addedKeysHash.has(key)) {
          addedKeysHash.set(key, true);
          addedKeys.push(key);
        }
      }

      for (const key of Object.keys(targetLang)) {
        if (!i18nKeysHash.has(key)) {
          unusedKeys.push(`${lang}.json: ${key}`);
        }
      }
    }

    if (addedKeys.length || unusedKeys.length) {
      console.log(`Folder: \x1b[33m${dir.i18nDir}\x1b[0m`);

      for (const key of addedKeys) {
        console.log(`Added key: ${key}`);
      }

      for (const key of unusedKeys) {
        console.log(`\x1b[31mUnused key\x1b[0m: ${key}`);
      }
    }

    if (addedKeys.length) {
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    console.log("Nothing changed");
  }
}
