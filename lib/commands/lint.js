import { __awaiter } from "tslib";
import chalk from "chalk";
import { parse } from "../parser/parse.js";
export function lint(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = parse({ config });
        const addedKeys = [];
        const unusedKeys = [];
        for (const [dir, rawData] of Object.entries(data)) {
            for (const key of rawData.stats.added) {
                addedKeys.push(`${dir}: "${key}"`);
            }
            for (const key of rawData.stats.unused) {
                unusedKeys.push(`${dir}: "${key}"`);
            }
        }
        if (addedKeys.length > 0) {
            console.log(chalk.red("Added keys:"));
            for (const key of addedKeys) {
                console.log(chalk.red(` - ${key}`));
            }
        }
        if (unusedKeys.length > 0) {
            console.log(chalk.red("Unused keys:"));
            for (const key of unusedKeys) {
                console.log(chalk.red(` - ${key}`));
            }
        }
        if (addedKeys.length !== 0 || unusedKeys.length !== 0) {
            throw new Error("Lint failed");
        }
        console.log(chalk.green("No issues found"));
    });
}
//# sourceMappingURL=lint.js.map