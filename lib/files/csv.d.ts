import type { I18nConfig, I18nRawDataKeysGroup } from "../types.js";
export declare function getCSVFiles(config: I18nConfig): Record<string, string>;
export declare function parseCSVFile(target: I18nRawDataKeysGroup, lang: string, filePath: string, config: I18nConfig): Promise<I18nRawDataKeysGroup>;
export declare function parseCSVFiles(config: I18nConfig): Promise<I18nRawDataKeysGroup>;
//# sourceMappingURL=csv.d.ts.map