import z from "zod";
export const configSchema = z.object({
    defaultLocale: z.string(),
    /**
     * Languages for which translations should be created.
     */
    locales: z.array(z.string()),
    /**
     * The type of application to generate translations for.
     */
    appType: z.enum(["vanilla", "vue"]).default("vanilla"),
    /**
     * Glob pattern to search for translation keys.
     */
    pattern: z.string(),
    /**
     * The name of the directory containing the translation files.
     */
    dirName: z.string().default("locales"),
    /**
     * Translation function name.
     */
    funcName: z.string().default("t"),
    componentName: z.string().default("ReI18n"),
    generate: z.object({
        /**
         * Path to the module that exports the `I18nLocaleLocator` implementation.
         */
        localeLocatorPath: z.string(),
        /**
         * Path to the module that exports the `I18nFormatter` implementation.
         */
        formatterPath: z.string().nullable().default(null),
        /**
         * If true, the keys will be sorted alphabetically.
         */
        sortKeys: z.boolean().default(true),
    }),
    json: z.object({
        /**
         * The output directory for the JSON file. The export file will be named `i18n.json`.
         */
        outDir: z.string(),
    }),
    csv: z.object({
        /**
         * The output directory for the CSV file. The export file will be named `{locale}.csv`.
         */
        outDir: z.string(),
        /**
         * The delimiter to be used for the CSV file.
         */
        delimiter: z.string(),
        /**
         * The directory containing the CSV files to import.
         */
        inputDir: z.string(),
    }),
    xls: z.object({
        /**
         * The output directory for the XLS file. The export file will be named `i18n.xls`.
         */
        outDir: z.string(),
        /**
         * The directory containing the XLS files to import.
         */
        inputDir: z.string(),
    }),
});
//# sourceMappingURL=config.js.map