import z from "zod";

export const configSchema = z.object({
  defaultLang: z.string(),
  langs: z.array(z.string()),
  /**
   * Path or pattern to i18n root, for example "src/{components/*\\,utils\\,somepath}"
   */
  pattern: z.string(),
  dirExt: z.string().default(".i18n"),
  fileExts: z.array(z.string()).default([".js", ".ts", ".vue"]),
  /**
   * Function namea
   */
  funcName: z.string().default("t"),
  /**
   * Getlang path
   */
  getLangPath: z.string().nullable(),
  /**
   * Formatter path
   */
  formatterPath: z.string().nullable().default(null),
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
  multiple: z.boolean().default(false),
});

export type I18nConfig = z.infer<typeof configSchema>;
