import { parse as babelParse, traverse as babelTraverse } from "@babel/core";
import type { CallExpression, StringLiteral } from "@babel/types";
import { isCallExpression, isIdentifier, isMemberExpression, isStringLiteral } from "@babel/types";
import fs from "fs";
import * as glob from "glob";
import path from "path";
import { VueCompiler } from "./compilers/vue.js";
import { ParseError } from "./error.js";
import type { I18nCompiler, I18nConfig, I18nKeyset, I18nRawData } from "./types.js";

const isFuncCall = (node: CallExpression, target: string) => {
  return isIdentifier(node.callee) && node.callee.name === target;
};

const isFuncMemberCall = (node: CallExpression, target: string) => {
  return (
    isMemberExpression(node.callee) &&
    isIdentifier(node.callee.property) &&
    node.callee.property.name === target
  );
};

const isFuncRawCall = (node: CallExpression, target: string) => {
  return (
    isMemberExpression(node.callee) &&
    isIdentifier(node.callee.property) &&
    isIdentifier(node.callee.object) &&
    node.callee.object.name === target &&
    node.callee.property.name === "raw"
  );
};

interface TraverseFileParams {
  /**
   * The path of the file to traverse.
   */
  file: string;
  /**
   * The name of the function to look for during traversal.
   */
  funcName: string;
  /**
   * An array of compilers to apply based on the file extension.
   */
  compilers: Array<I18nCompiler>;
  /**
   * A callback function to handle errors.
   */
  onEnter(key: string, target: StringLiteral, node: CallExpression): void;
  /**
   * A callback function to execute when encountering the specified function call.
   */
  onError(error: unknown): void;
}

/**
 * Traverses a file and calls the onEnter callback when funcName is encountered.
 */
function traverseFile(params: TraverseFileParams) {
  const filename = path.basename(params.file);
  const fileExt = path.extname(filename);
  const codeRaw = fs.readFileSync(params.file, { encoding: "utf8" });

  const code = params.compilers.reduce((result, compiler) => {
    if (compiler.match(fileExt)) {
      const [code, errors] = compiler.compile(result);
      if (errors.length > 0) {
        for (const error of errors) {
          params.onError(error);
        }
      }
      return code;
    }
    return result;
  }, codeRaw);

  // TODO: move babel config to a separate file
  const ast = babelParse(code, {
    filename,
    presets: ["@babel/typescript"],
    plugins: ["@babel/plugin-transform-typescript"],
  });

  if (ast === null) {
    params.onError(new ParseError("Failed to parse file"));
    return;
  }

  babelTraverse(ast, {
    enter(p) {
      const { node } = p;

      if (!isCallExpression(node)) {
        return;
      }

      if (node.arguments.length < 1) {
        return;
      }

      if (
        isFuncCall(node, params.funcName) ||
        isFuncRawCall(node, params.funcName) ||
        isFuncMemberCall(node, params.funcName)
      ) {
        const target = node.arguments[0];

        if (isStringLiteral(target)) {
          const key = target.value;
          params.onEnter(key, target, node);
        }
      }
    },
  });
}

/**
 * Reads translations from a JSON file for a specific language.
 * @param lang - The language code for the translations.
 * @param file - The path to the file containing the translations.
 * @param localeDirName - The name of the directory where the translations are stored.
 * @returns An object representing the translations for the specified language.
 */
function readTranslations(lang: string, file: string, localeDirName: string): I18nKeyset<string> {
  const dirName = path.dirname(file);
  const translationDir = path.join(dirName, localeDirName);
  const targetFile = path.join(translationDir, `${lang}.json`);

  if (!fs.existsSync(targetFile)) {
    return {};
  }

  const data = fs.readFileSync(targetFile, { encoding: "utf-8" });
  return JSON.parse(data);
}

interface ParseParams {
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
export function parse(params: ParseParams): Record<string, I18nRawData> {
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
            files: [],
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
      onError(error) {
        if (params.onError) {
          params.onError(file, error);
        }
      },
      onEnter(key, target) {
        rawDataDict[dirName].stats.all.add(key);

        const comment = (target.leadingComments || target.trailingComments || [])
          .map((block) => block.value.trim())
          .join("\n");

        if (!rawDataDict[dirName].keys[key]) {
          rawDataDict[dirName].keys[key] = {
            files: [],
            locales: {},
          };
        }

        rawDataDict[dirName].keys[key].files.push({ file, comment });

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
