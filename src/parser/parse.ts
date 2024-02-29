import * as glob from "glob";
import path from "path";
import { normalizeKey } from "../common.js";
import { VueCompiler } from "../compilers/vue.js";
import type { I18nCompiler, I18nConfig, I18nRawData } from "../types.js";
import { readTranslations } from "./readTranslations.js";
import { traverseFile } from "./traverseFile.js";

export interface I18nParserParams {
  /**
   * The configuration for the parser.
   */
  config: I18nConfig;
  /**
   * A callback function to execute when entering a directory.
   */
  onEnterDir?(dir: string): void;
  /**
   * A callback function to execute when starting to parse a file.
   */
  onEnterFile?(file: string): void;
  /**
   * A callback function to execute when an error occurs.
   */
  onError?(file: string, error: unknown): void;
  /**
   * A callback function to execute when the parser encounters a translation key.
   */
  onEntry?(file: string, lang: string, key: string, translation: string, comment: string): void;
}

/**
 * Finds all files matching the pattern in the config, reads the translations for each language,
 * from corresponding JSON files, and parses the files for translation keys.
 */
export function parse(params: I18nParserParams): Record<string, I18nRawData> {
  const rawDataDict: Record<string, I18nRawData> = {};

  for (const file of glob.sync(params.config.pattern)) {
    // TODO: refactor compilers
    const compilers: Array<I18nCompiler> = [];
    if (params.config.appType === "vue") {
      compilers.push(new VueCompiler(file));
    }

    const dirName = path.dirname(file);
    if (path.basename(dirName) === params.config.dirName) {
      continue;
    }

    if (!rawDataDict[dirName]) {
      if (params.onEnterDir) {
        params.onEnterDir(dirName);
      }
      rawDataDict[dirName] = {
        keys: {},
        stats: {
          all: new Set(),
          added: new Set(),
          unused: new Set(),
        },
      };

      for (const lang of params.config.locales) {
        // read translations from JSON file and add them to the raw data
        const currentLocale = readTranslations(lang, file, params.config.dirName);

        for (const oldKey of Object.keys(currentLocale)) {
          rawDataDict[dirName].keys[oldKey] = {
            ...rawDataDict[dirName].keys[oldKey],
            files: {},
            locales: {
              ...rawDataDict[dirName].keys[oldKey]?.locales,
              [lang]: currentLocale[oldKey],
            },
          };
          rawDataDict[dirName].stats.unused.add(oldKey);
        }
      }
    }

    if (params.onEnterFile) {
      params.onEnterFile(file);
    }

    traverseFile({
      file,
      compilers,
      funcName: params.config.funcName,
      componentName: params.config.componentName,
      composableName: params.config.composableName,
      onError(error) {
        if (params.onError) {
          params.onError(file, error);
        }
      },
      onEnter(target) {
        const key = normalizeKey(target.value);

        rawDataDict[dirName].stats.all.add(key);

        const comment = (target.leadingComments || target.trailingComments || [])
          .map((block) => block.value.trim())
          .join("\n");

        if (!rawDataDict[dirName].keys[key]) {
          rawDataDict[dirName].keys[key] = {
            files: {},
            locales: {},
          };
        }

        rawDataDict[dirName].keys[key].files[file] = {
          comment,
          notes: {},
        };

        for (const lang of params.config.locales) {
          const translation = rawDataDict[dirName].keys[key].locales[lang];
          if (typeof translation === "undefined") {
            rawDataDict[dirName].stats.added.add(key);
          }

          if (params.onEntry) {
            params.onEntry(file, lang, key, translation || "", comment);
          }

          rawDataDict[dirName].keys[key].locales[lang] = translation || "";
        }
      },
    });

    // TODO: update to traverseFile first, then remove unused keys
    if (rawDataDict[dirName].stats.all.size === 0 && rawDataDict[dirName].stats.unused.size === 0) {
      // nothing found in this directory, remove it from the raw data
      delete rawDataDict[dirName];
    } else {
      for (const key of rawDataDict[dirName].stats.all) {
        if (rawDataDict[dirName].stats.unused.has(key)) {
          rawDataDict[dirName].stats.unused.delete(key);
        }
      }
    }
  }

  return rawDataDict;
}
