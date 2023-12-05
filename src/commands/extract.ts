import * as csv from "csv";
import path from "path";
import fs from "fs";
import { VueCompiler } from "../compilers/vue.js";
import { getTranslationsFor, walkDirs, walkFiles } from "../parser/files.js";
import { traverseFile } from "../parser/traverse.js";
import type {
  I18nCompiler,
  I18nConfig,
  I18nExportData,
  I18nExportDataEntries,
} from "../types";

export function extract(config: I18nConfig) {
  const precompilers: Array<I18nCompiler> = [];
  if (config.appType === "vue") {
    precompilers.push(new VueCompiler());
  }

  const entries: I18nExportDataEntries = {};

  walkDirs(config.pattern, config.dirExt, (dir) => {
    console.log(`Searching in \x1b[33m${dir.path}\x1b[0m`);

    walkFiles(dir.path, config.fileExts, (file) => {
      traverseFile(file, config.funcName, precompilers, (key, target, node) => {
        const comments = target.leadingComments || target.trailingComments;
        if (!entries[dir.i18nDir]) {
          entries[dir.i18nDir] = {};
        }
        const translations = getTranslationsFor(dir, config.langs, config.sort);
        const nodeTranslations: Record<string, string> = {};
        for (const lang of config.langs) {
          nodeTranslations[lang] = translations[lang][key];
        }
        entries[dir.i18nDir][key] = {
          translations: nodeTranslations,
          file,
        };
        if (comments) {
          const i18nComment = comments
            .map((block) => block.value.trim())
            .join("\n");
          entries[dir.i18nDir][key].comment = i18nComment;
        }
      });
    });
  });

  const exportData: I18nExportData = {
    entries,
    meta: {
      datetime: new Date().toUTCString(),
    },
  };

  const outDirPath = path.resolve(config.outDir);
  if (!fs.existsSync(config.outDir)) {
    fs.mkdirSync(outDirPath);
  }

  for (const lang of config.langs) {
    const csvData: string[][] = [["key", "translation", "comment"]];
    for (const [_, entryData] of Object.entries(exportData.entries)) {
      for (const [key, meta] of Object.entries(entryData)) {
        csvData.push([key, meta.translations[lang], meta.comment || ""]);
      }
    }
    csv.stringify(
      csvData,
      {
        delimiter: ";",
      },
      (err, output) => {
        fs.writeFileSync(path.resolve(config.outDir, `${lang}.csv`), output, {
          encoding: "utf8",
        });
      }
    );
  }

  fs.writeFileSync(
    path.resolve(config.outDir, "i18n.json"),
    JSON.stringify(exportData, null, 2),
    {
      encoding: "utf8",
    }
  );
}
