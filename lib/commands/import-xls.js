import { __awaiter } from "tslib";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { sortKeyset } from "../common.js";
import { parseXLSFile } from "../files/xls.js";
import { parse } from "../parser/parse.js";
function parseSourceCode(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataToImport = {};
        try {
            const xlsData = yield parseXLSFile(config);
            parse({
                config,
                onEntry(file, lang, key, translation, comment) {
                    var _a;
                    const dirName = path.dirname(file);
                    if (!xlsData[dirName]) {
                        console.log(chalk.yellow(`${chalk.bold(dirName)}: no translation found for the key "${chalk.bold(key)}"`));
                        return;
                    }
                    if (!dataToImport[dirName]) {
                        dataToImport[dirName] = {};
                    }
                    if (!dataToImport[dirName][key]) {
                        dataToImport[dirName][key] = {
                            files: {},
                            locales: {},
                        };
                    }
                    dataToImport[dirName][key].files[file] = { comment, notes: {} };
                    const xlsTranslation = (_a = xlsData[dirName][key]) === null || _a === void 0 ? void 0 : _a.locales[lang];
                    dataToImport[dirName][key].locales[lang] = xlsTranslation || translation;
                },
            });
        }
        catch (error) {
            console.log(chalk.red(error instanceof Error ? error.message : error));
        }
        return dataToImport;
    });
}
export function importXLS(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataToImport = yield parseSourceCode(config);
        const entries = Object.entries(dataToImport);
        if (entries.length === 0) {
            console.log(chalk.yellow("No data to import"));
            return;
        }
        for (const [dir, rawData] of entries) {
            const targetDir = path.resolve(path.join(dir, config.dirName));
            if (!fs.existsSync(targetDir)) {
                console.log(chalk.red(`Directory ${chalk.bold(dir)} does not exist`));
                continue;
            }
            for (const lang of config.locales) {
                let fileData = {};
                for (const [key, keyData] of Object.entries(rawData)) {
                    fileData[key] = keyData.locales[lang];
                }
                if (config.generate.sortKeys) {
                    fileData = sortKeyset(fileData);
                }
                const targetFile = path.join(dir, config.dirName, `${lang}.json`);
                console.log(`Import locale into ${chalk.bold(targetFile)}`);
                fs.writeFileSync(path.resolve(targetFile), JSON.stringify(fileData, null, 2) + "\n", {
                    encoding: "utf8",
                });
            }
        }
    });
}
//# sourceMappingURL=import-xls.js.map