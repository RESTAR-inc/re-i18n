#!/usr/bin/env node
import chalk from "chalk";
import { Argument, Command } from "commander";
import path from "path";
import { exportCSV } from "./commands/export-csv.js";
import { exportJSON } from "./commands/export-json.js";
import { generate } from "./commands/generate.js";
import { loadConfig } from "./config.js";

new Command("re-i18n")
  .description("Re-i18n is a tool to generate i18n files from a single source of truth")
  .addArgument(
    new Argument("<command>", "Command to run").choices(["generate", "export-csv", "export-json"])
  )
  .option("-c, --config <string>", "Load config from file", "./re-i18n.config.json")
  .action((command, options) => {
    try {
      const config = loadConfig(path.resolve(options.config))!;

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
      }
    } catch (error) {
      console.log(chalk.red(error instanceof Error ? error.message : error));
    }
  })
  .parse(process.argv);
