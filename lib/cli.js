#!/usr/bin/env node
import chalk from "chalk";
import { Argument, Command } from "commander";
import path from "path";
import { exportCSV } from "./commands/export-csv.js";
import { exportJSON } from "./commands/export-json.js";
import { exportXLS } from "./commands/export-xls.js";
import { generate } from "./commands/generate.js";
import { importCSV } from "./commands/import-csv.js";
import { importXLS } from "./commands/import-xls.js";
import { stats } from "./commands/stats.js";
import { loadConfig } from "./config.js";
new Command("re-i18n")
    .description("Re-i18n is a tool to generate i18n files from a single source of truth")
    .addArgument(new Argument("<command>", "Command to run").choices([
    "generate",
    "export-csv",
    "export-json",
    "export-xls",
    "import-csv",
    "import-xls",
    "stats",
]))
    .option("-c, --config <string>", "Load config from file", "./re-i18n.config.json")
    .action((command, options) => {
    try {
        const config = loadConfig(path.resolve(options.config));
        if (!config) {
            return;
        }
        switch (command) {
            case "generate":
                generate(config);
                break;
            case "export-csv":
                exportCSV(config);
                break;
            case "export-json":
                exportJSON(config);
                break;
            case "export-xls":
                exportXLS(config);
                break;
            case "import-csv":
                importCSV(config);
                break;
            case "import-xls":
                importXLS(config);
                break;
            case "stats":
                stats(config);
                break;
        }
    }
    catch (error) {
        console.log(chalk.red(error instanceof Error ? error.message : error));
    }
})
    .parse(process.argv);
//# sourceMappingURL=cli.js.map