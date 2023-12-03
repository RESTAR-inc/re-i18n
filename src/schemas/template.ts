import z from "zod";

export const templateDataSchema = z.object({
  funcName: z.string(),
  langs: z.array(z.string()),
  getLangPath: z.string().nullable(),
  formatterPath: z.string().nullable(),
  multiple: z.boolean().default(false),
});

export type I18nTemplateData = z.infer<typeof templateDataSchema>;
