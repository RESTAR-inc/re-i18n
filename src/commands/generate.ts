import chalk from "chalk";
import fs from "fs";
import path from "path";
import { parse } from "../parser.js";
import type { I18nConfig } from "../schemas/config.js";
import type { I18nKeyset } from "../types.js";

export function generate(config: I18nConfig) {
  const rawData = parse(config, (file) => {
    console.log(`${chalk.blue("File parsed:")} ${file}`);
  });

  // console.log(JSON.stringify(rawData, null, 2));

  for (const [file, i18nKeys] of Object.entries(rawData)) {
    const dirName = path.dirname(file);
    const targetDir = path.resolve(path.join(dirName, config.dirName));
    const fileName = path.basename(file, path.extname(file));

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    for (const lang of config.langs) {
      const fileData: I18nKeyset<string> = {};
      for (const [key, keyData] of Object.entries(i18nKeys)) {
        fileData[key] = keyData.locales[lang];
      }

      const targetFile = path.join(targetDir, `${lang}.${fileName}.json`);

      fs.writeFileSync(targetFile, `${JSON.stringify(fileData, null, 2)}\n`, {
        encoding: "utf8",
      });
    }
  }

  // console.log(data);

  // for (const [dir, files] of Object.entries(rawData)) {
  //   const translations: LangData = {};
  //   const i18nDirName = path.join(dir, `${path.basename(dir)}${config.dirExt}`);

  //   for (const translationKeys of Object.values(files)) {
  //     if (!translations[i18nDirName]) {
  //       translations[i18nDirName] = {};
  //     }

  //     for (const [key, values] of Object.entries(translationKeys)) {
  //       for (const [lang, value] of Object.entries(values.translations)) {
  //         if (!translations[i18nDirName][lang]) {
  //           translations[i18nDirName][lang] = {};
  //         }
  //         translations[i18nDirName][lang][key] = value;
  //       }
  //     }
  //   }

  //   console.log(translations);
  // }

  // const translationKeys = new Map<string, Set<string>>();
  // console.log(translationKeys);
  // walkDirs(config.pattern, config.dirExt, (dir) => {
  //   console.log(`Searching in \x1b[33m${dir.path}\x1b[0m`);
  //   const translationKeys = new Set<string>();
  //   walkFiles(dir.path, (file) => {
  //     traverseFile(file, config.funcName, compilers, (key) => {
  //       translationKeys.add(key);
  //     });
  //   });
  //   const addedKeys = new Set<string>();
  //   const unusedKeys: Array<string> = [];
  //   const translations = getTranslationsFor(dir, config.langs);
  //   for (const lang of config.langs) {
  //     const targetLangKeys = Object.keys(translations[lang]);
  //     for (const key of translationKeys) {
  //       if (targetLangKeys.includes(key)) {
  //         continue;
  //       }
  //       translations[lang][key] = "";
  //       addedKeys.add(key);
  //     }
  //     for (const key of Object.keys(translations[lang])) {
  //       if (!translationKeys.has(key)) {
  //         unusedKeys.push(`${lang}.json: ${key}`);
  //       }
  //     }
  //   }
  //   if (addedKeys.size > 0 || unusedKeys.length > 0) {
  //     console.log(`Folder: \x1b[33m${dir.i18nDir}\x1b[0m`);
  //     for (const key of addedKeys) {
  //       console.log(`Added key: ${key}`);
  //     }
  //     for (const key of unusedKeys) {
  //       console.log(`\x1b[31mUnused key\x1b[0m: ${key}`);
  //     }
  //   }
  //   // if (translationKeys.size > 0) {
  //   //   const tpl = render(createTemplateData(config, dir));
  //   //   writeI8nDirectory(
  //   //     dir,
  //   //     config.langs,
  //   //     translations,
  //   //     tpl,
  //   //     config.generate.sortKeys
  //   //   );
  //   // }
  // });
}
