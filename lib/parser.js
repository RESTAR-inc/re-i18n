import { parse as babelParse, traverse as babelTraverse } from "@babel/core";
import { isCallExpression, isIdentifier, isMemberExpression, isObjectExpression, isObjectProperty, isStringLiteral, isVariableDeclarator, } from "@babel/types";
import fs from "fs";
import * as glob from "glob";
import path from "path";
import { VueCompiler } from "./compilers/vue.js";
import { ParseError } from "./error.js";
/**
 * Traverses a file and calls the onEnter callback when funcName is encountered.
 */
function traverseFile(params) {
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
                node.callee.name === params.funcName) {
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
/**
 * Reads translations from a JSON file for a specific language.
 * @param lang - The language code for the translations.
 * @param file - The path to the file containing the translations.
 * @param localeDirName - The name of the directory where the translations are stored.
 * @returns An object representing the translations for the specified language.
 */
function readTranslations(lang, file, localeDirName) {
    const dirName = path.dirname(file);
    const translationDir = path.join(dirName, localeDirName);
    const targetFile = path.join(translationDir, `${lang}.json`);
    if (!fs.existsSync(targetFile)) {
        return {};
    }
    const data = fs.readFileSync(targetFile, { encoding: "utf-8" });
    return JSON.parse(data);
}
/**
 * Finds all files matching the pattern in the config, reads the translations for each language,
 * from corresponding JSON files, and parses the files for translation keys.
 */
export function parse(params) {
    var _a;
    const rawDataDict = {};
    for (const file of glob.sync(params.config.pattern)) {
        // TODO: refactor compilers
        const compilers = [];
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
                    rawDataDict[dirName].keys[oldKey] = Object.assign(Object.assign({}, rawDataDict[dirName].keys[oldKey]), { files: [], locales: Object.assign(Object.assign({}, (_a = rawDataDict[dirName].keys[oldKey]) === null || _a === void 0 ? void 0 : _a.locales), { [lang]: currentLocale[oldKey] }) });
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
            onError(error) {
                if (params.onError) {
                    params.onError(file, error);
                }
            },
            onEnter(target) {
                const key = target.value;
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
        }
        else {
            for (const key of rawDataDict[dirName].stats.all) {
                if (rawDataDict[dirName].stats.unused.has(key)) {
                    rawDataDict[dirName].stats.unused.delete(key);
                }
            }
        }
    }
    return rawDataDict;
}
//# sourceMappingURL=parser.js.map