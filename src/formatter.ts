import type { I18nFormatter, I18nParams } from "./types.js";

const OPEN_BRACKET = "{";
const CLOSE_BRACKET = "}";

/**
 * Default implementation of the I18nFormatter interface.
 * It replaces all the {placeholders} in the message with the values in the params object.
 * It's recommended to use a custom implementation of this interface to support more complex
 * formatting.
 */
export const formatter: I18nFormatter = (_locale: string, message: string, params?: I18nParams) => {
  if (!params) {
    return message;
  }

  for (const [key, value] of Object.entries(params)) {
    const pattern = `${OPEN_BRACKET}${key}${CLOSE_BRACKET}`;
    const reg = new RegExp(pattern, "g");
    message = message.replace(reg, value?.toString() ?? "");
  }

  return message;
};
