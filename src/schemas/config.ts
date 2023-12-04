import z from "zod";

export const configSchema = z.object({
  appType: z.enum(["vanilla", "vue"]),
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
  getLangPath: z.string(),
  /**
   * Formatter path
   */
  formatterPath: z.string().nullable().default(null),
  /**
   * Sort keys
   */
  sort: z.boolean().default(false),
});

export type I18nConfig = z.infer<typeof configSchema>;
