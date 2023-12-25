import { computed, defineComponent } from "vue";
export function createI18n(localeKeyset, formatter, useLocaleLocator, defaultLocale) {
    const locale = useLocaleLocator(Object.keys(localeKeyset), defaultLocale);
    const useI18n = () => {
        return computed(() => (key, params) => {
            const keyset = localeKeyset[locale.value];
            if (!keyset) {
                throw new Error(`No locale for "${locale.value}"`);
            }
            const message = keyset[key] || key;
            return formatter(locale.value, message, params);
        }).value;
    };
    const parseMessage = (key, locale) => {
        const keyset = localeKeyset[locale];
        if (!keyset) {
            throw new Error(`No locale for "${locale}"`);
        }
        const result = [];
        let lastIndex = 0;
        const message = keyset[key] || key;
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
                const parsed = parseMessage(props.msg, locale.value);
                return parsed.map((chunk) => {
                    if (chunk.type === "text") {
                        return formatter(locale.value, chunk.value);
                    }
                    return children[chunk.index];
                });
            };
        },
    });
    return { Component, useI18n, locale };
}
//# sourceMappingURL=createI18n.js.map