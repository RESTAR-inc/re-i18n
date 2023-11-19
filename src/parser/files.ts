import fs from "fs";
import path from "path";
import * as glob from "glob";

interface I18nDirectory {
  root: string;
  name: string;
  parentDir: string;
}

interface I18nKeysets {
  [lang: string]: {
    [key: string]: string;
  };
}

function sortObjectKeys(target: Record<string, string>) {
  return Object.keys(target)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = target[key];
      return acc;
    }, {});
}

export function getFilesList(dir: string, exts: Array<string>): Array<string> {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const filesList: string[] = [];

  for (const file of files) {
    const ext = path.extname(file.name);

    if (exts.includes(ext)) {
      const filePath = path.join(dir, file.name);
      filesList.push(filePath);
    }
  }

  return filesList;
}

export function getDirectories(
  searchStr: string,
  dirExt = ".i18n"
): Array<I18nDirectory> {
  const pathMap = new Map<string, I18nDirectory>();

  for (const filePath of glob.sync(searchStr)) {
    const root = path.dirname(filePath);
    const info = fs.lstatSync(root);

    if (!pathMap.has(root) && info.isDirectory() && !root.endsWith(dirExt)) {
      console.log(`Searching in \x1b[33m${root}\x1b[0m`);

      const name = path.basename(root);
      const parentDir = path.join(root, `${name}${dirExt}`);

      pathMap.set(root, { root, name, parentDir });
    }
  }

  return Array.from(pathMap.values());
}

export function readDirectory(
  root: I18nDirectory,
  langs: string[],
  sort = false
) {
  const translations: I18nKeysets = {};

  langs.forEach((lang) => {
    translations[lang] = {};
  });

  const rootI18nDir = root.parentDir;

  if (fs.existsSync(rootI18nDir)) {
    langs.forEach((lang) => {
      const langFilePath = path.join(rootI18nDir, `${lang}.json`);
      if (fs.existsSync(langFilePath)) {
        const json: Record<string, string> = JSON.parse(
          fs.readFileSync(langFilePath, { encoding: "utf8" })
        );

        translations[lang] = sort ? sortObjectKeys(json) : json;
      }
    });
  }

  return translations;
}
