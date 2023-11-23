import fs from "fs";
import z from "zod";

const configSchema = z.object({
  langs: z.array(z.string()),
  /**
   * Path or pattern to i18n root, for example "src/{components/*\\,utils\\,somepath}"
   */
  path: z.string(),
  /**
   * Function namea
   */
  func: z.string().default("$t"),
  out: z.string().optional(),
  /**
   * Getlang path
   */
  getLang: z.string().optional(),
  /**
   * Formatter path
   */
  fmt: z.string().optional(),
  stats: z.boolean().default(false),
  hash: z.string().optional(),
  prefix: z.string().optional(),
  repo: z.string().optional(),
  delimiter: z.string().default(","),
  /**
   * Env var name
   */
  env: z.string().default("I18N_LOCALE_NAME"),
  /**
   * Sort keys
   */
  sort: z.boolean().default(false),
  /**
   * Split languages
   */
  split: z.boolean().default(false),
  dirExt: z.string().default(".i18n"),
  fileExts: z.array(z.string()).default([".js", ".ts", ".vue"]),
});

export type I18nConfig = z.infer<typeof configSchema>;

export function loadConfig(path: string) {
  try {
    const configStr = fs.readFileSync(path, { encoding: "utf8" });
    return configSchema.parse(configStr);
  } catch (err) {
    throw new Error(`Failed to load config from ${path}`);
  }
}
