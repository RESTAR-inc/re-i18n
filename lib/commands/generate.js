import { __awaiter } from "tslib";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import prompts from "prompts";
import { sortKeyset } from "../common.js";
import { parse } from "../parser.js";
import { render } from "../template/render.js";
function formatKeyList(set) {
    return Array.from(set)
        .map((key) => `\t- ${key}`)
        .join("\n");
}
export function generate(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = parse({
            config,
            onEnterDir(dir) {
                console.log(chalk.cyan.bold(dir));
            },
            onEnterFile(file) {
                console.log(`  ${chalk.bold.blue(path.basename(file))}`);
            },
            onError(file, err) {
                const message = err instanceof Error ? err.message : `Error parsing "${file}": ${err}`;
                console.log(chalk.red(message));
            },
        });
        const localesToCreate = {};
        const localesToDelete = new Set();
        for (const [dir, rawData] of Object.entries(data)) {
            let addNewKeys = false;
            let removeUnusedKeys = false;
            if (rawData.stats.added.size > 0) {
                const { proceed } = yield prompts({
                    type: "confirm",
                    name: "proceed",
                    initial: true,
                    message: [
                        chalk.yellow("New keys have been found in"),
                        chalk.blue(dir),
                        "\n",
                        formatKeyList(rawData.stats.added),
                        "\n",
                        chalk.blue("Would you like to add them?"),
                    ].join(" "),
                });
                addNewKeys = Boolean(proceed);
            }
            if (rawData.stats.unused.size > 0) {
                const { proceed } = yield prompts({
                    type: "confirm",
                    name: "proceed",
                    initial: true,
                    message: [
                        chalk.yellow("Unused keys have been found in"),
                        chalk.red(dir),
                        "\n",
                        formatKeyList(rawData.stats.unused),
                        "\n",
                        chalk.red("Do you want to delete them?"),
                    ].join(" "),
                });
                removeUnusedKeys = Boolean(proceed);
            }
            for (const lang of config.locales) {
                let fileData = {};
                for (const [key, keyData] of Object.entries(rawData.keys)) {
                    if (rawData.stats.added.has(key)) {
                        if (addNewKeys) {
                            fileData[key] = keyData.locales[lang];
                        }
                    }
                    else if (rawData.stats.unused.has(key)) {
                        if (!removeUnusedKeys) {
                            fileData[key] = keyData.locales[lang];
                        }
                    }
                    else {
                        fileData[key] = keyData.locales[lang];
                    }
                }
                if (Object.keys(fileData).length === 0) {
                    localesToDelete.add(dir);
                }
                else {
                    if (config.generate.sortKeys) {
                        fileData = sortKeyset(fileData);
                    }
                    if (!localesToCreate[dir]) {
                        localesToCreate[dir] = {};
                    }
                    localesToCreate[dir][lang] = JSON.stringify(fileData, null, 2);
                }
            }
        }
        for (const dir of localesToDelete) {
            const dirToDelete = path.resolve(path.join(dir, config.dirName));
            if (fs.existsSync(dirToDelete)) {
                const { proceed } = yield prompts({
                    type: "confirm",
                    name: "proceed",
                    initial: true,
                    message: [
                        chalk.yellow("An unused locale directory was found in"),
                        chalk.red(dir),
                        "\n",
                        chalk.red("Do you want to delete it?"),
                    ].join(" "),
                });
                if (proceed) {
                    console.log(`${chalk.red("Deleting a directory")} ${chalk.bold(dir)}`);
                    fs.rmSync(dirToDelete, { recursive: true });
                }
            }
        }
        for (const [dir, files] of Object.entries(localesToCreate)) {
            const dirName = path.join(dir, config.dirName);
            const dirTarget = path.resolve(dirName);
            if (!fs.existsSync(dirTarget)) {
                console.log(`Creating directory ${chalk.bold(dirName)}`);
                fs.mkdirSync(dirTarget, { recursive: true });
            }
            for (const [file, content] of Object.entries(files)) {
                const fileName = path.join(dir, config.dirName, `${file}.json`);
                const fileTarget = path.resolve(fileName);
                console.log(`Saving locale file at ${chalk.bold(fileName)}`);
                fs.writeFileSync(fileTarget, content + "\n", { encoding: "utf8" });
            }
            const template = render(config, dirTarget);
            const templateFileName = path.join(dir, config.dirName, "index.ts");
            const templateFileTarget = path.resolve(templateFileName);
            console.log(`Saving template file at ${chalk.bold(templateFileName)}`);
            fs.writeFileSync(templateFileTarget, template, { encoding: "utf8" });
        }
    });
}
//# sourceMappingURL=generate.js.map