#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import { jsonExport } from "../commands/json-export.js";
import { loadConfig } from "../config.js";

const program = new Command();

program.option("-c, --config <string>", "Load config from file", "./i18n.config.json");

program.parse(process.argv);

const opts = program.opts<{
  config: string;
}>();

const config = loadConfig(path.resolve(opts.config));

jsonExport(config);
