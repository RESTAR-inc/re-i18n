import { createI18n, formatter } from "../src";

describe("i18n", () => {
  describe("createI18n", () => {
    it("should create a translator function", () => {
      const KEYSET = {
        en: { "こんにちは {name}": "Hello {name}" },
        ja: { "こんにちは {name}": "" },
      };
      const translator = createI18n(KEYSET, formatter, () => "en", "ja");
      expect(translator("こんにちは {name}", { name: "John" })).toBe("Hello John");
    });

    it("should return the same message if no translation is found", () => {
      const KEYSET = {
        en: { "こんにちは {name}": "Hello {name}" },
        ja: { "こんにちは {name}": "" },
      };
      const translator = createI18n(KEYSET, formatter, () => "ja", "ja");
      expect(translator("こんにちは {name}", { name: "John" })).toBe("こんにちは John");
    });
  });
});
