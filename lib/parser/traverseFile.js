import { parse as babelParse, traverse as babelTraverse } from "@babel/core";
import { isCallExpression, isIdentifier, isMemberExpression, isObjectExpression, isObjectProperty, isStringLiteral, isVariableDeclarator, } from "@babel/types";
import fs from "fs";
import path from "path";
import { ParseError } from "../error.js";
/**
 * Traverses a file and calls the onEnter callback when funcName is encountered.
 */
export function traverseFile(params) {
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
    let funcNameVDOM = null;
    babelTraverse(ast, {
        enter(p) {
            const { node } = p;
            if (isCallExpression(node) &&
                isIdentifier(node.callee) &&
                (node.callee.name === params.funcName || node.callee.name === params.composableName)) {
                // If the function was called directly
                const arg = node.arguments[0];
                if (isStringLiteral(arg)) {
                    params.onEnter(arg);
                }
            }
            else if (isCallExpression(node) &&
                isMemberExpression(node.callee) &&
                isIdentifier(node.callee.property) &&
                node.callee.property.name === params.funcName) {
                // If the function was called inside the VDOM
                const arg = node.arguments[0];
                if (isStringLiteral(arg)) {
                    params.onEnter(arg);
                }
            }
            else if (isCallExpression(node) &&
                isMemberExpression(node.callee) &&
                isIdentifier(node.callee.property) &&
                isIdentifier(node.callee.object) &&
                node.callee.object.name === params.funcName &&
                node.callee.property.name === "$") {
                // Shortcut for composables
                const arg = node.arguments[0];
                if (isStringLiteral(arg)) {
                    params.onEnter(arg);
                }
            }
            else if (isVariableDeclarator(node) &&
                isIdentifier(node.id) &&
                isCallExpression(node.init)) {
                // VDom First Step: search for internal component name
                const arg = node.init.arguments[0];
                if (isStringLiteral(arg) && arg.value === params.componentName) {
                    funcNameVDOM = node.id.name;
                }
            }
            else if (funcNameVDOM !== null && isCallExpression(node)) {
                // VDom Second Step: search for an internal component call
                const arg1 = node.arguments[0];
                const arg2 = node.arguments[1];
                if (isIdentifier(arg1) && arg1.name === funcNameVDOM && isObjectExpression(arg2)) {
                    const prop = arg2.properties[0];
                    if (isObjectProperty(prop) &&
                        isIdentifier(prop.key) &&
                        isStringLiteral(prop.value) &&
                        prop.key.name === "msg") {
                        params.onEnter(prop.value);
                    }
                }
            }
        },
    });
}
//# sourceMappingURL=traverseFile.js.map