import type { I18nFormatter, I18nParam, I18nParams } from "./types.js";

class DefaultFormatter implements I18nFormatter {
  private static readonly openBracket = "{";
  private static readonly closeBracket = "}";

  private traverse(_message: string, _options: I18nParams) {
    // TODO: implement
    const result: Array<I18nParam> = [];
    return result;
  }

  str(message: string, _options?: I18nParams): string {
    // TODO: implement
    return message;
  }
}

export const formatter = new DefaultFormatter();
