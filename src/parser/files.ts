import fs from "fs";
import path from "path";
import * as glob from "glob";
import { I18nDirectory, I18nKeysets } from "../types";

function sortObjectKeys(target: Record<string, string>) {
  return Object.keys(target)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = target[key];
      return acc;
    }, {});
}

export function getFilesList(dir: string, exts: Array<string>): Array<string> {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .reduce<string[]>((acc, file) => {
      const ext = path.extname(file.name);

      if (exts.includes(ext)) {
        const filePath = path.join(dir, file.name);
        acc.push(filePath);
      }

      return acc;
    }, []);
}

export function getDirectories(
  searchStr: string,
  dirExt: string
): Array<I18nDirectory> {
  const pathMap = new Map<string, I18nDirectory>();

  for (const filePath of glob.sync(searchStr)) {
    const dirPath = path.dirname(filePath);
    const info = fs.lstatSync(dirPath);

    if (
      !pathMap.has(dirPath) &&
      info.isDirectory() &&
      !dirPath.endsWith(dirExt)
    ) {
      console.log(`Searching in \x1b[33m${dirPath}\x1b[0m`);

      const name = path.basename(dirPath);
      const i18nDir = path.join(dirPath, `${name}${dirExt}`);

      pathMap.set(dirPath, { path: dirPath, name, i18nDir });
    }
  }

  return Array.from(pathMap.values());
}

export function readDirectory(
  dir: I18nDirectory,
  langs: Array<string>,
  sort: boolean
): I18nKeysets {
  const translations = langs.reduce<I18nKeysets>((acc, lang) => {
    acc[lang] = {};
    return acc;
  }, {});

  if (!fs.existsSync(dir.i18nDir)) {
    return translations;
  }

  return langs.reduce<I18nKeysets>((acc, lang) => {
    const langFilePath = path.join(dir.i18nDir, `${lang}.json`);

    if (fs.existsSync(langFilePath)) {
      const json: Record<string, string> = JSON.parse(
        fs.readFileSync(langFilePath, { encoding: "utf8" })
      );

      acc[lang] = sort ? sortObjectKeys(json) : json;
    }

    return acc;
  }, {});
}

export function writeDirectory(
  dir: I18nDirectory,
  langs: Array<string>,
  keysets: I18nKeysets,
  template: string,
  sort: boolean
) {
  if (!fs.existsSync(dir.i18nDir)) {
    fs.mkdirSync(dir.i18nDir);
  }

  for (const lang of langs) {
    const langFilePath = path.join(dir.i18nDir, `${lang}.json`);
    const data = sort ? sortObjectKeys(keysets[lang]) : keysets[lang];

    fs.writeFileSync(langFilePath, `${JSON.stringify(data, null, 2)}\n`, {
      encoding: "utf8",
    });
  }

  fs.writeFileSync(path.join(dir.i18nDir, "index.ts"), template, {
    encoding: "utf8",
  });
}
