import { computed, defineComponent, type PropType } from "vue";
import type { I18nFormatter, I18nLocaleKeyset, I18nParams, I18nRawChunk } from "../../types.js";
import type { UseLocaleLocator } from "./types.js";

export function createI18n<L extends string, K extends string>(
  localeKeyset: I18nLocaleKeyset<L, K>,
  formatter: I18nFormatter<L>,
  useLocaleLocator: UseLocaleLocator<L>,
  defaultLocale: L
) {
  const locale = useLocaleLocator(Object.keys(localeKeyset) as L[], defaultLocale);

  const useI18n = () => {
    return computed(() => (key: K, params?: I18nParams) => {
      const keyset = localeKeyset[locale.value];
      if (!keyset) {
        throw new Error(`No locale for "${locale.value}"`);
      }
      const message = keyset[key] || key;

      return formatter(locale.value, message, params);
    }).value;
  };

  const parseMessage = (key: K, locale: L): Array<I18nRawChunk> => {
    const keyset = localeKeyset[locale];
    if (!keyset) {
      throw new Error(`No locale for "${locale}"`);
    }

    const result: Array<I18nRawChunk> = [];
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

      result.push(
        {
          type: "text",
          value: msg,
        },
        {
          type: "node",
          index: paramIndex,
        }
      );

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
        type: String as unknown as PropType<K>,
        required: true,
      },
    },
    setup(props, ctx) {
      if (!ctx.slots.default) {
        return null;
      }
      const children = ctx.slots.default();

      return () => {
        const parsed = parseMessage(props.msg as K, locale.value);

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
