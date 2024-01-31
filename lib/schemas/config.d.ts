import z from "zod";
export declare const configSchema: z.ZodObject<{
    defaultLocale: z.ZodString;
    /**
     * Languages for which translations should be created.
     */
    locales: z.ZodArray<z.ZodString, "many">;
    /**
     * The type of application to generate translations for.
     */
    appType: z.ZodDefault<z.ZodEnum<["vanilla", "vue"]>>;
    /**
     * Glob pattern to search for translation keys.
     */
    pattern: z.ZodString;
    /**
     * The name of the directory containing the translation files.
     */
    dirName: z.ZodDefault<z.ZodString>;
    /**
     * Translation function name.
     */
    funcName: z.ZodDefault<z.ZodString>;
    /**
     * The name of the generated component that will be used to render the translations.
     */
    componentName: z.ZodDefault<z.ZodString>;
    /**
     * The name of the generated composable function that will be used to render the translations.
     */
    composableName: z.ZodDefault<z.ZodString>;
    generate: z.ZodObject<{
        /**
         * Path to the module that exports the `I18nLocaleLocator` implementation.
         */
        localeLocatorPath: z.ZodString;
        /**
         * Path to the module that exports the `I18nFormatter` implementation.
         */
        formatterPath: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        /**
         * If true, the keys will be sorted alphabetically.
         */
        sortKeys: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        localeLocatorPath: string;
        formatterPath: string | null;
        sortKeys: boolean;
    }, {
        localeLocatorPath: string;
        formatterPath?: string | null | undefined;
        sortKeys?: boolean | undefined;
    }>;
    json: z.ZodObject<{
        /**
         * The output directory for the JSON file. The export file will be named `i18n.json`.
         */
        outDir: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        outDir: string;
    }, {
        outDir: string;
    }>;
    csv: z.ZodObject<{
        /**
         * The output directory for the CSV file. The export file will be named `{locale}.csv`.
         */
        outDir: z.ZodString;
        /**
         * The delimiter to be used for the CSV file.
         */
        delimiter: z.ZodString;
        /**
         * The directory containing the CSV files to import.
         */
        inputDir: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        outDir: string;
        delimiter: string;
        inputDir: string;
    }, {
        outDir: string;
        delimiter: string;
        inputDir: string;
    }>;
    xls: z.ZodObject<{
        /**
         * The output directory for the XLS file. The export file will be named `i18n.xls`.
         */
        outDir: z.ZodString;
        /**
         * The directory containing the XLS files to import.
         */
        inputDir: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        outDir: string;
        inputDir: string;
    }, {
        outDir: string;
        inputDir: string;
    }>;
}, "strip", z.ZodTypeAny, {
    defaultLocale: string;
    locales: string[];
    appType: "vanilla" | "vue";
    pattern: string;
    dirName: string;
    funcName: string;
    componentName: string;
    composableName: string;
    generate: {
        localeLocatorPath: string;
        formatterPath: string | null;
        sortKeys: boolean;
    };
    json: {
        outDir: string;
    };
    csv: {
        outDir: string;
        delimiter: string;
        inputDir: string;
    };
    xls: {
        outDir: string;
        inputDir: string;
    };
}, {
    defaultLocale: string;
    locales: string[];
    pattern: string;
    generate: {
        localeLocatorPath: string;
        formatterPath?: string | null | undefined;
        sortKeys?: boolean | undefined;
    };
    json: {
        outDir: string;
    };
    csv: {
        outDir: string;
        delimiter: string;
        inputDir: string;
    };
    xls: {
        outDir: string;
        inputDir: string;
    };
    appType?: "vanilla" | "vue" | undefined;
    dirName?: string | undefined;
    funcName?: string | undefined;
    componentName?: string | undefined;
    composableName?: string | undefined;
}>;
export type I18nConfig = z.infer<typeof configSchema>;
//# sourceMappingURL=config.d.ts.map