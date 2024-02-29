import type { I18nKeyset } from "../types.js";
/**
 * Reads translations from a JSON file for a specific language.
 * @param lang - The language code for the translations.
 * @param file - The path to the file containing the translations.
 * @param localeDirName - The name of the directory where the translations are stored.
 * @returns An object representing the translations for the specified language.
 */
export declare function readTranslations(lang: string, file: string, localeDirName: string): I18nKeyset<string>;
//# sourceMappingURL=readTranslations.d.ts.map