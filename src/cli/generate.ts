#!/usr/bin/env node
import path from "path";

import { Command } from "commander";
import { loadConfig } from "../config.js";
import { generate } from "../commands/generate.js";

const program = new Command();

program.option(
  "-c, --config <string>",
  "Load config from file",
  "./i18n.config.json"
);

program.parse(process.argv);

const opts = program.opts<{
  config: string;
}>();

const config = loadConfig(path.resolve(opts.config));

generate(config);