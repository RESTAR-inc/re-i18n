import { __awaiter } from "tslib";
import chalk from "chalk";
import path from "path";
import { parse } from "../parser.js";
export function stats(config) {
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
        const statisitics = {};
        for (const rawData of Object.values(data)) {
            for (const keyData of Object.values(rawData.keys)) {
                for (const [locale, translation] of Object.entries(keyData.locales)) {
                    if (!statisitics[locale]) {
                        statisitics[locale] = {
                            yes: 0,
                            no: 0,
                            total: 0,
                        };
                    }
                    statisitics[locale].total += 1;
                    statisitics[locale].yes += translation ? 1 : 0;
                    statisitics[locale].no += !translation ? 1 : 0;
                }
            }
        }
        console.log("\n");
        for (const [locale, stats] of Object.entries(statisitics)) {
            console.log("Locale:", locale);
            console.log("  yes:", ((stats.yes / stats.total) * 100).toFixed(2), "%");
            console.log("  no:", ((stats.no / stats.total) * 100).toFixed(2), "%");
            console.log("\n");
        }
    });
}
//# sourceMappingURL=stats.js.map