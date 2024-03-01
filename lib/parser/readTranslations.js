import fs from "fs";
import path from "path";
/**
 * Reads translations from a JSON file for a specific language.
 * @param lang - The language code for the translations.
 * @param file - The path to the file containing the translations.
 * @param localeDirName - The name of the directory where the translations are stored.
 * @returns An object representing the translations for the specified language.
 */
export function readTranslations(lang, file, localeDirName) {
    const dirName = path.dirname(file);
    const translationDir = path.join(dirName, localeDirName);
    const targetFile = path.join(translationDir, `${lang}.json`);
    if (!fs.existsSync(targetFile)) {
        return {};
    }
    const data = fs.readFileSync(targetFile, { encoding: "utf-8" });
    return JSON.parse(data);
}
//# sourceMappingURL=readTranslations.js.map