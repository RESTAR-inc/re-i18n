import type { I18nFormatter, I18nGetLocale, I18nLocaleKeyset, I18nParams } from "./types.js";
export declare function createI18n<L extends string, K extends string>(localeKeyset: I18nLocaleKeyset<L, K>, formatter: I18nFormatter<L>, getLocale: I18nGetLocale<L>, defaultLocale: L): (key: K, params?: I18nParams) => string;
//# sourceMappingURL=i18n.d.ts.map