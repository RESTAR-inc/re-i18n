import path from "path";

import {
  getDirectories,
  getFilesList,
  readDirectory,
  writeDirectory,
} from "../parser/files.js";
import { I18nConfig } from "../schemas/config.js";
import { traverseFile } from "../parser/traverse.js";
import { render } from "../template/index.js";
import { I18nDirectory, I18nCompiler, I18nTemplateData } from "../types.js";
import { VueCompiler } from "../parser/compilers/vue.js";

function createTemplateData(
  config: I18nConfig,
  dir: I18nDirectory
): I18nTemplateData {
  return {
    appType: config.appType,
    formatterPath: config.formatterPath
      ? path.relative(dir.i18nDir, config.formatterPath)
      : null,
    getLangPath: path.relative(dir.i18nDir, config.getLangPath),
    funcName: config.funcName,
    langs: config.langs,
  };
}

export function generate(config: I18nConfig) {
  const directories = getDirectories(config.pattern, config.dirExt);

  let hasChanges = false;

  const precompilers: Array<I18nCompiler> = [];
  if (config.appType === "vue") {
    precompilers.push(new VueCompiler());
  }

  for (const dir of directories) {
    const files = getFilesList(dir.path, config.fileExts);

    const i18nKeysHash = new Map<string, true>();
    const i18nKeys: string[] = [];

    for (const file of files) {
      traverseFile(file, config.funcName, precompilers, (key) => {
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
      const tpl = render(createTemplateData(config, dir));
      writeDirectory(dir, config.langs, translations, tpl, config.sort);
    }

    if (addedKeys.length > 0 || unusedKeys.length > 0) {
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    console.log("Nothing changed");
  }
}
