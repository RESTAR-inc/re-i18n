import { parse as babelParse, traverse as babelTraverse } from "@babel/core";
import type { CallExpression, StringLiteral } from "@babel/types";
import {
  isCallExpression,
  isIdentifier,
  isMemberExpression,
  isStringLiteral,
} from "@babel/types";
import fs from "fs";
import * as glob from "glob";
import path from "path";
import { getLocaleFilePath } from "./common.js";
import { VueCompiler } from "./compilers/vue.js";
import { ParseError } from "./error.js";
import type {
  I18nCompiler,
  I18nConfig,
  I18nKeyset,
  I18nRawData,
} from "./types";

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

function readLocaleFile(file: string): I18nKeyset<string> {
  if (!fs.existsSync(file)) {
    return {};
  }

  const data = fs.readFileSync(file, { encoding: "utf-8" });
  return JSON.parse(data);
}

interface ParseParams {
  config: I18nConfig;
  onEnter(file: string): void;
  onData(file: string, data: I18nRawData): Promise<void>;
  onError(file: string, error: unknown): void;
}

export async function parse(params: ParseParams) {
  for (const file of glob.sync(params.config.pattern)) {
    params.onEnter(file);

    // TODO: refactor compilers
    const compilers: Array<I18nCompiler> = [];
    if (params.config.appType === "vue") {
      compilers.push(new VueCompiler(file));
    }

    const dirName = path.dirname(file);

    const rawData: I18nRawData = {
      keys: {},
      newKeys: [],
      unusedKeys: [],
    };

    const oldKeys = new Set<string>();
    const newKeys = new Set<string>();
    const allKeys = new Set<string>();

    // TODO: add extra check for dirName
    if (path.basename(dirName) === params.config.dirName) {
      continue;
    }

    for (const lang of params.config.langs) {
      const targetFile = getLocaleFilePath(lang, file, params.config.dirName);
      const currentLocale = readLocaleFile(targetFile);

      for (const oldKey of Object.keys(currentLocale)) {
        rawData.keys[oldKey] = {
          ...rawData.keys[oldKey],
          comment: "",
          locales: {
            ...rawData.keys[oldKey]?.locales,
            [lang]: currentLocale[oldKey],
          },
        };
        oldKeys.add(oldKey);
      }
    }

    traverseFile({
      file,
      compilers,
      funcName: params.config.funcName,
      onError(error) {
        params.onError(file, error);
      },
      onEnter(key, target) {
        allKeys.add(key);

        const comment = (
          target.leadingComments ||
          target.trailingComments ||
          []
        )
          .map((block) => block.value.trim())
          .join("\n");

        rawData.keys[key] = {
          comment,
          locales: {
            ...rawData.keys[key]?.locales,
          },
        };

        for (const lang of params.config.langs) {
          const translation = rawData.keys[key].locales[lang];
          if (typeof translation === "undefined") {
            newKeys.add(key);
          }
          rawData.keys[key].locales[lang] = translation || "";
        }
      },
    });

    for (const key of allKeys) {
      if (oldKeys.has(key)) {
        oldKeys.delete(key);
      }
    }

    rawData.newKeys = Array.from(newKeys);
    rawData.unusedKeys = Array.from(oldKeys);

    await params.onData(file, rawData);
  }
}
