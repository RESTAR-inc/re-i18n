import fs from "fs";
import * as glob from "glob";
import path from "path";
import type { I18nDirectory, I18nKeysets } from "../types";

function sortObjectKeys(target: Record<string, string>) {
  return Object.keys(target)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = target[key];
      return acc;
    }, {});
}

export function walkFiles(
  dir: string,
  exts: Array<string>,
  handler: (fileName: string) => void
) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const ext = path.extname(file.name);

    if (exts.includes(ext)) {
      handler(path.join(dir, file.name));
    }
  }
}

export function walkDirs(
  searchStr: string,
  dirExt: string,
  handler: (dir: I18nDirectory) => void
) {
  const visited = new Set<string>();

  for (const filePath of glob.sync(searchStr)) {
    const dirPath = path.dirname(filePath);
    const info = fs.lstatSync(dirPath);

    if (!info.isDirectory()) {
      continue;
    }

    if (dirPath.endsWith(dirExt)) {
      continue;
    }

    if (visited.has(dirPath)) {
      continue;
    }

    const name = path.basename(dirPath);
    const i18nDir = path.join(dirPath, `${name}${dirExt}`);

    const directory = {
      name,
      i18nDir,
      path: dirPath,
    };

    handler(directory);

    visited.add(dirPath);
  }
}

export function getTranslationsFor(
  dir: I18nDirectory,
  langs: Array<string>,
  sort: boolean
): I18nKeysets {
  if (!fs.existsSync(dir.i18nDir)) {
    return langs.reduce<I18nKeysets>((acc, lang) => {
      acc[lang] = {};
      return acc;
    }, {});
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

export function writeI8nDirectory(
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
