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
  file: string;
  funcName: string;
  compilers: Array<I18nCompiler>;
  onEnter(key: string, target: StringLiteral, node: CallExpression): void;
  onError(error: unknown): void;
}

function traverseFile(params: TraverseFileParams) {
  const filename = path.basename(params.file);
  const fileExt = path.extname(filename);
  const codeRaw = fs.readFileSync(params.file, { encoding: "utf8" });

  const code = params.compilers.reduce((result, compiler) => {
    if (compiler.match(fileExt)) {
      try {
        return compiler.compile(result);
      } catch (error) {
        params.onError(error);
        return "";
      }
    }
    return result;
  }, codeRaw);

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
  config: I18nConfig;
  onEnterDir(dir: string): void;
  onEnterFile(file: string): void;
  onError(file: string, error: unknown): void;
}

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
      params.onEnterDir(dirName);
      rawDataDict[dirName] = {
        keys: {},
        stats: {
          all: new Set(),
          added: new Set(),
          unused: new Set(),
        },
      };

      for (const lang of params.config.langs) {
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

    params.onEnterFile(file);

    traverseFile({
      file,
      compilers,
      funcName: params.config.funcName,
      onError(error) {
        params.onError(file, error);
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

        for (const lang of params.config.langs) {
          const translation = rawDataDict[dirName].keys[key].locales[lang];
          if (typeof translation === "undefined") {
            rawDataDict[dirName].stats.added.add(key);
          }
          rawDataDict[dirName].keys[key].locales[lang] = translation || "";
        }
      },
    });

    for (const key of rawDataDict[dirName].stats.all) {
      if (rawDataDict[dirName].stats.unused.has(key)) {
        rawDataDict[dirName].stats.unused.delete(key);
      }
    }
  }

  return rawDataDict;
}
