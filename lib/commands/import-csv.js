import { __awaiter } from "tslib";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { sortKeyset } from "../common.js";
import { parseCSVFiles } from "../files/csv.js";
import { parse } from "../parser/parse.js";
export function importCSV(config) {
    return __awaiter(this, void 0, void 0, function* () {
        let parsedCsv;
        try {
            parsedCsv = yield parseCSVFiles(config);
        }
        catch (error) {
            console.log(chalk.red(error instanceof Error ? error.message : error));
            return;
        }
        const dataToImport = {};
        parse({
            config,
            onEntry(file, lang, key, translation, comment) {
                var _a;
                const dirName = path.dirname(file);
                if (!parsedCsv[dirName]) {
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
                const csvTranslation = (_a = parsedCsv[dirName][key]) === null || _a === void 0 ? void 0 : _a.locales[lang];
                dataToImport[dirName][key].locales[lang] = csvTranslation || translation;
            },
        });
        for (const [dir, rawData] of Object.entries(dataToImport)) {
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
//# sourceMappingURL=import-csv.js.map