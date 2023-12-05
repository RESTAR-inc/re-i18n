import {
  walkDirs,
  walkFiles,
  getTranslationsFor,
  writeI8nDirectory,
} from "../parser/files.js";
import { I18nConfig } from "../schemas/config.js";
import { traverseFile } from "../parser/traverse.js";
import { createTemplateData, render } from "../template/index.js";
import { I18nCompiler } from "../types.js";
import { VueCompiler } from "../compilers/vue.js";

export function generate(config: I18nConfig) {
  const precompilers: Array<I18nCompiler> = [];
  if (config.appType === "vue") {
    precompilers.push(new VueCompiler());
  }

  walkDirs(config.pattern, config.dirExt, (dir) => {
    console.log(`Searching in \x1b[33m${dir.path}\x1b[0m`);

    const translationKeys = new Set<string>();

    walkFiles(dir.path, config.fileExts, (file) => {
      traverseFile(file, config.funcName, precompilers, (key) => {
        translationKeys.add(key);
      });
    });

    const addedKeys: string[] = [];
    const addedKeysHash = new Map<string, true>();
    const unusedKeys: Array<string> = [];

    const translations = getTranslationsFor(dir, config.langs, config.sort);

    for (const lang of config.langs) {
      const targetLangKeys = Object.keys(translations[lang]);

      for (const key of translationKeys) {
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
        if (!translationKeys.has(key)) {
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

    if (translationKeys.size > 0) {
      const tpl = render(createTemplateData(config, dir));
      writeI8nDirectory(dir, config.langs, translations, tpl, config.sort);
    }
  });
}
