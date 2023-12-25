import type { I18nConfig, I18nRawData } from "./types.js";
interface ParseParams {
    /**
     * The configuration for the parser.
     */
    config: I18nConfig;
    /**
     * A callback function to execute when entering a directory.
     */
    onEnterDir?(dir: string): void;
    /**
     * A callback function to execute when starting to parse a file.
     */
    onEnterFile?(file: string): void;
    /**
     * A callback function to execute when an error occurs.
     */
    onError?(file: string, error: unknown): void;
    /**
     * A callback function to execute when the parser encounters a translation key.
     */
    onEntry?(file: string, lang: string, key: string, translation: string, comment: string): void;
}
/**
 * Finds all files matching the pattern in the config, reads the translations for each language,
 * from corresponding JSON files, and parses the files for translation keys.
 */
export declare function parse(params: ParseParams): Record<string, I18nRawData>;
export {};
//# sourceMappingURL=parser.d.ts.map