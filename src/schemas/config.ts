import z from "zod";

export const configSchema = z.object({
  appType: z.enum(["vanilla", "vue"]),
  langs: z.array(z.string()),
  pattern: z.string(),
  dirName: z.string().default("locales"),
  funcName: z.string().default("t"),
  generate: z.object({
    getLangPath: z.string(),
    formatterPath: z.string().nullable().default(null),
    sortKeys: z.boolean().default(false),
  }),
  json: z.object({
    outDir: z.string(),
    pretty: z.boolean().default(true),
  }),
  csv: z.object({
    outDir: z.string(),
    delimiter: z.string(),
  }),
});

export type I18nConfig = z.infer<typeof configSchema>;
