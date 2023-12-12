import z from "zod";

export const configSchema = z.object({
  /**
   * The type of application to generate translations for.
   */
  appType: z.enum(["vanilla", "vue"]),
  /**
   * The languages to generate translations for.
   */
  langs: z.array(z.string()),
  /**
   * The glob pattern to search for translation keys.
   */
  pattern: z.string(),
  /**
   * The name of the directory containing the translation files.
   */
  dirName: z.string().default("locales"),
  /**
   * The name of the translation function.
   */
  funcName: z.string().default("t"),
  generate: z.object({
    /**
     * The path to the module that exports the `I18nGetLocale` implementation.
     */
    getLangPath: z.string(),
    /**
     * The path to the module that exports the `I18nFormatter` implementation.
     */
    formatterPath: z.string().nullable().default(null),
    /**
     * If true, the keys will be sorted alphabetically.
     */
    sortKeys: z.boolean().default(true),
  }),
  json: z.object({
    outDir: z.string(),
    pretty: z.boolean().default(true),
  }),
  csv: z.object({
    outDir: z.string(),
    delimiter: z.string(),
    inputDir: z.string(),
  }),
  xls: z.object({
    outDir: z.string(),
    inputDir: z.string(),
  }),
});

export type I18nConfig = z.infer<typeof configSchema>;
