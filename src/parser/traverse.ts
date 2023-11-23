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
import { Precompiler } from "./compilers/base";
import VuePrecompiler from "./compilers/vue";

type NodeEnterHandler = (
  key: string,
  node: CallExpression,
  keyNode: StringLiteral
) => void;

const precompilers: Array<Precompiler> = [new VuePrecompiler()];

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
  onNodeEnter: NodeEnterHandler
) {
  const filename = path.basename(file);
  const fileExt = path.extname(filename);
  const codeRaw = fs.readFileSync(file, { encoding: "utf8" });

  const code = precompilers.reduce((code, precompiler) => {
    if (precompiler.match(fileExt)) {
      return precompiler.compile(code);
    }
    return code;
  }, codeRaw);

  const ast = parse(code, {
    presets: ["@babel/typescript"],
    filename,
    plugins: [],
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
        const firstArgument = node.arguments[0];

        if (isStringLiteral(firstArgument)) {
          const key = firstArgument.value;
          onNodeEnter(key, node, firstArgument);
        }
      }
    },
  });
}
