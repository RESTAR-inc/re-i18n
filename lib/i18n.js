export function createI18n(localeKeyset, formatter, getLocale, defaultLocale) {
    const locales = Object.keys(localeKeyset);
    function translator(key, params) {
        const locale = getLocale(locales, defaultLocale);
        const keyset = localeKeyset[locale];
        if (!keyset) {
            throw new Error(`No locale for "${locale}"`);
        }
        const message = keyset[key] || key;
        return formatter(locale, message, params);
    }
    return translator;
}
//# sourceMappingURL=i18n.js.map