import type { I18nFormatter, I18nParams } from "./types.js";

/**
 * Default implementation of the I18nFormatter interface.
 * It replaces all the {placeholders} in the message with the values in the params object.
 * It's recommended to use a custom implementation of this interface to support more complex
 * formatting.
 */
class DefaultFormatter implements I18nFormatter {
  private static readonly openBracket = "{";
  private static readonly closeBracket = "}";

  str(message: string, params?: I18nParams): string {
    if (!params) {
      return message;
    }

    for (const [key, value] of Object.entries(params)) {
      const pattern = `${DefaultFormatter.openBracket}${key}${DefaultFormatter.closeBracket}`;
      const reg = new RegExp(pattern, "g");
      message = message.replace(reg, value?.toString() ?? "");
    }

    return message;
  }
}

export const formatter = new DefaultFormatter();
