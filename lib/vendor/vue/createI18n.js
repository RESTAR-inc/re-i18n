import { computed, defineComponent } from "vue";
import { normalizeKey } from "../../common.js";
export function createI18n(localeKeyset, formatter, useLocaleLocator, defaultLocale) {
    const locale = useLocaleLocator(Object.keys(localeKeyset), defaultLocale);
    const keyset = computed(() => {
        const value = localeKeyset[locale.value];
        if (!value) {
            throw new Error(`No locale found for "${locale.value}"`);
        }
        return value;
    });
    const t = (key, params) => {
        const message = keyset.value[key] || key;
        return formatter(locale.value, message, params);
    };
    const useReI18n = (key, params) => computed(() => t(key, params));
    const translate = (key, params) => t(key, params);
    translate.$ = useReI18n;
    const parseMessage = (key) => {
        const result = [];
        let lastIndex = 0;
        const message = keyset.value[key] || key;
        for (const match of message.matchAll(/{\d+}/g)) {
            if (typeof match.index !== "number") {
                continue;
            }
            const pattern = match[0].slice(1, -1).trim();
            if (!pattern) {
                continue;
            }
            const msgStarts = lastIndex;
            const msgEnds = match.index;
            const msg = message.slice(msgStarts, msgEnds);
            const paramIndex = parseInt(pattern, 10);
            result.push({
                type: "text",
                value: msg,
            }, {
                type: "node",
                index: paramIndex,
            });
            lastIndex = match.index + match[0].length;
        }
        result.push({
            type: "text",
            value: message.slice(lastIndex),
        });
        return result;
    };
    const Component = defineComponent({
        props: {
            msg: {
                type: String,
                required: true,
            },
        },
        setup(props, ctx) {
            if (!ctx.slots.default) {
                return null;
            }
            const children = ctx.slots.default();
            return () => {
                const message = normalizeKey(props.msg);
                const parsed = parseMessage(message);
                return parsed.map((chunk) => {
                    if (chunk.type === "text") {
                        return formatter(locale.value, chunk.value);
                    }
                    return children[chunk.index];
                });
            };
        },
    });
    return { Component, useReI18n, locale, translate };
}
//# sourceMappingURL=createI18n.js.map