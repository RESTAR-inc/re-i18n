import z from "zod";
export declare const templateDataSchema: z.ZodObject<{
    defaultLocale: z.ZodString;
    locales: z.ZodArray<z.ZodString, "many">;
    appType: z.ZodDefault<z.ZodEnum<["vanilla", "vue"]>>;
    componentName: z.ZodString;
    funcName: z.ZodString;
    localeLocatorPath: z.ZodString;
    formatterPath: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    defaultLocale: string;
    locales: string[];
    appType: "vanilla" | "vue";
    funcName: string;
    componentName: string;
    localeLocatorPath: string;
    formatterPath: string | null;
}, {
    defaultLocale: string;
    locales: string[];
    funcName: string;
    componentName: string;
    localeLocatorPath: string;
    appType?: "vanilla" | "vue" | undefined;
    formatterPath?: string | null | undefined;
}>;
export type I18nTemplateData = z.infer<typeof templateDataSchema>;
//# sourceMappingURL=template.d.ts.map