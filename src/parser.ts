import { parse as babelParse, traverse as babelTraverse } from "@babel/core";
import type { CallExpression } from "@babel/types";
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
import type {
  I18nCompiler,
  I18nConfig,
  I18nFileTraverseHandler,
  I18nKeyset,
  I18nLocales,
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

function traverseFile(
  file: string,
  funcName: string,
  compilers: Array<I18nCompiler>,
  onNodeEnter: I18nFileTraverseHandler
) {
  const filename = path.basename(file);
  const fileExt = path.extname(filename);
  const codeRaw = fs.readFileSync(file, { encoding: "utf8" });

  const code = compilers.reduce((result, compiler) => {
    if (compiler.match(fileExt)) {
      return compiler.compile(result);
    }
    return result;
  }, codeRaw);

  const ast = babelParse(code, {
    presets: ["@babel/typescript"],
    filename,
    plugins: ["@babel/plugin-transform-typescript"],
  });

  if (ast === null) {
    throw new Error("Failed to parse file");
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
        isFuncCall(node, funcName) ||
        isFuncRawCall(node, funcName) ||
        isFuncMemberCall(node, funcName)
      ) {
        const target = node.arguments[0];

        if (isStringLiteral(target)) {
          const key = target.value;
          onNodeEnter(key, target, node);
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

export function parse(
  config: I18nConfig,
  onEach?: (file: string) => void
): I18nRawData {
  // TODO: refactor com
  const compilers: Array<I18nCompiler> = [];
  if (config.appType === "vue") {
    compilers.push(new VueCompiler());
  }

  const rawData: I18nRawData = {};

  for (const file of glob.sync(config.pattern)) {
    const dirName = path.dirname(file);

    // TODO: add extra check for dirName
    if (path.basename(dirName) === config.dirName) {
      continue;
    }

    const existingLocales: I18nLocales<string, string> = {};
    for (const lang of config.langs) {
      const targetFile = getLocaleFilePath(lang, file, config.dirName);
      existingLocales[lang] = readLocaleFile(targetFile);
    }

    traverseFile(file, config.funcName, compilers, (key, target) => {
      const comment = (target.leadingComments || target.trailingComments || [])
        .map((block) => block.value.trim())
        .join("\n");

      const locales: Record<string, string> = {};
      for (const lang of config.langs) {
        locales[lang] = existingLocales[lang][key] || "";
      }

      rawData[file] = {
        ...rawData[file],
        [key]: {
          locales,
          comment,
        },
      };
    });

    if (onEach) {
      onEach(file);
    }
  }

  return rawData;
}
