import z from "zod";

export const configSchema = z.object({
  langs: z.array(z.string()),
  path: z.string().optional(),
  func: z.string().default("$t"),
  out: z.string().optional(),
  getLang: z.string().optional(),
  fmt: z.string().optional(),
  stats: z.boolean().default(false),
  hash: z.string().optional(),
  prefix: z.string().optional(),
  repo: z.string().optional(),
  delimiter: z.string().default(","),
  env: z.string().optional(),
});

export type I18nConfig = z.infer<typeof configSchema>;

export class Config {
  load() {}
}
