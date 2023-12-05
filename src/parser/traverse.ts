import fs from "fs";
import path from "path";
import { traverse, parse } from "@babel/core";
import {
  CallExpression,
  isCallExpression,
  isIdentifier,
  isStringLiteral,
  StringLiteral,
  isMemberExpression,
} from "@babel/types";

import type { I18nCompiler, I18nFileTraverseHandler } from "../types";

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

export function traverseFile(
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

  const ast = parse(code, {
    presets: ["@babel/typescript"],
    filename,
    plugins: ["@babel/plugin-transform-typescript"],
  });

  if (ast === null) {
    throw new Error("Failed to parse file");
  }

  traverse(ast, {
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
