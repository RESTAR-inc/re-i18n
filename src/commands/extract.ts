import path from "path";
import fs from "fs";
import { VueCompiler } from "../compilers/vue.js";
import {
  getDirectories,
  getFilesList,
  readDirectory,
} from "../parser/files.js";
import { traverseFile } from "../parser/traverse.js";
import type {
  I18nCompiler,
  I18nConfig,
  I18nExportData,
  I18nExportDataEntries,
} from "../types";

export function extract(config: I18nConfig) {
  const directories = getDirectories(config.pattern, config.dirExt);

  const precompilers: Array<I18nCompiler> = [];
  if (config.appType === "vue") {
    precompilers.push(new VueCompiler());
  }

  const entries: I18nExportDataEntries = {};

  for (const dir of directories) {
    const files = getFilesList(dir.path, config.fileExts);

    for (const file of files) {
      traverseFile(file, config.funcName, precompilers, (key, target, node) => {
        const comments = target.leadingComments || target.trailingComments;

        if (!entries[dir.i18nDir]) {
          entries[dir.i18nDir] = {};
        }

        const translations = readDirectory(dir, config.langs, config.sort);

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
    }
  }

  const exportData: I18nExportData = {
    entries,
    meta: {
      datetime: new Date().toUTCString(),
    },
  };

  const payload = JSON.stringify(exportData, null, 2);
  const outDirPath = path.resolve(config.outDir);

  if (!fs.existsSync(config.outDir)) {
    fs.mkdirSync(outDirPath);
  }

  const outFilePath = path.resolve(config.outDir, "i18n.json");
  fs.writeFileSync(outFilePath, payload, { encoding: "utf8" });
}
