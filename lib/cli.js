#!/usr/bin/env node
import { __awaiter } from "tslib";
import chalk from "chalk";
import { Argument, Command } from "commander";
import path from "path";
import { exportCSV } from "./commands/export-csv.js";
import { exportJSON } from "./commands/export-json.js";
import { exportXLS } from "./commands/export-xls.js";
import { generate } from "./commands/generate.js";
import { importCSV } from "./commands/import-csv.js";
import { importXLS } from "./commands/import-xls.js";
import { lint } from "./commands/lint.js";
import { stats } from "./commands/stats.js";
import { loadConfig } from "./config.js";
const program = new Command("re-i18n")
    .description("Re-i18n is a tool to generate i18n files from a single source of truth")
    .addArgument(new Argument("<command>", "Command to run").choices([
    "generate",
    "export-csv",
    "export-json",
    "export-xls",
    "import-csv",
    "import-xls",
    "stats",
    "lint",
]))
    .option("-c, --config <string>", "Load config from file", "./re-i18n.config.json");
program
    .action((command, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = loadConfig(path.resolve(options.config));
        if (!config) {
            throw new Error("Config file not found");
        }
        switch (command) {
            case "generate":
                yield generate(config);
                break;
            case "export-csv":
                yield exportCSV(config);
                break;
            case "export-json":
                yield exportJSON(config);
                break;
            case "export-xls":
                yield exportXLS(config);
                break;
            case "import-csv":
                yield importCSV(config);
                break;
            case "import-xls":
                yield importXLS(config);
                break;
            case "stats":
                yield stats(config);
                break;
            case "lint":
                yield lint(config);
                break;
        }
    }
    catch (error) {
        program.error(chalk.red(chalk.bold(error instanceof Error ? error.message : error)), {
            exitCode: 1,
        });
    }
}))
    .parse(process.argv);
//# sourceMappingURL=cli.js.map