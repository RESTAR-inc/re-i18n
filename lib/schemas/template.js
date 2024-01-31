import z from "zod";
export const templateDataSchema = z.object({
    defaultLocale: z.string(),
    locales: z.array(z.string()),
    appType: z.enum(["vanilla", "vue"]).default("vanilla"),
    componentName: z.string(),
    funcName: z.string(),
    composableName: z.string(),
    localeLocatorPath: z.string(),
    formatterPath: z.string().nullable().default(null),
});
//# sourceMappingURL=template.js.map