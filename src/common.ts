import type { I18nKeyset } from "./types.js";

export function sortKeyset(target: I18nKeyset<string>): I18nKeyset<string> {
  const keys = Object.keys(target);
  keys.sort();

  const result: I18nKeyset<string> = {};

  for (const key of keys) {
    result[key] = target[key];
  }

  return result;
}
