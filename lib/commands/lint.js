import { __awaiter } from "tslib";
import chalk from "chalk";
import path from "path";
import { parse } from "../parser/parse.js";
export function lint(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = parse({ config });
        // const prefix = path.resolve(config.srcDir);
        const keys = [];
        for (const [dir, rawData] of Object.entries(data)) {
            for (const key of rawData.stats.added) {
                keys.push({ key, path: path.resolve(dir), reason: "A new key was found" });
            }
            for (const key of rawData.stats.unused) {
                keys.push({ key, path: path.resolve(dir), reason: "An unused key was found" });
            }
        }
        if (keys.length > 0) {
            for (const key of keys) {
                console.log(chalk.underline(key.path));
                console.log(`  ${chalk.red("error")}  ${key.reason}: "${chalk.bold(chalk.yellow(key.key))}"\n`);
            }
            throw new Error("Lint failed");
        }
    });
}
//# sourceMappingURL=lint.js.map