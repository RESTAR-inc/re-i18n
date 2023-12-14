import z from "zod";

export const templateDataSchema = z.object({
  defaultLocale: z.string(),
  locales: z.array(z.string()),
  funcName: z.string(),
  getLocalePath: z.string(),
  formatterPath: z.string().nullable().default(null),
});

export type I18nTemplateData = z.infer<typeof templateDataSchema>;
