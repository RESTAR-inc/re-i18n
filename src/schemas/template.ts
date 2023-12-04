import z from "zod";

export const templateDataSchema = z.object({
  appType: z.enum(["vanilla", "vue"]),
  funcName: z.string(),
  langs: z.array(z.string()),
  getLangPath: z.string(),
  formatterPath: z.string().nullable(),
});

export type I18nTemplateData = z.infer<typeof templateDataSchema>;
