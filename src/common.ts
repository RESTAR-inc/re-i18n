import type { I18nKeyset } from "./types.js";

export function sortKeyset(target: I18nKeyset<string>): I18nKeyset<string> {
  const keys = Object.keys(target).sort();

  const result: I18nKeyset<string> = {};

  for (const key of keys) {
    result[key] = target[key];
  }

  return result;
}

const strReplacements: Record<string, string> = {
  "\\\\": "\\",
  "\\n": "\n",
  "\\t": "\t",
  "\\r": "\r",
};

export function normalizeKey(key: string) {
  return key.replace(/\\(\\|n|t|r|")/g, (replace) => strReplacements[replace]);
}
