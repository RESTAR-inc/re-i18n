import { computed, defineComponent, type PropType } from "vue";
import type { I18nFormatter, I18nLocaleKeyset, I18nParams, I18nRawChunk } from "../../types";
import type { UseLocaleLocator } from "./types";

export function createI18n<T extends string>(
  localeKeyset: I18nLocaleKeyset<T>,
  formatter: I18nFormatter,
  useLocaleLocator: UseLocaleLocator,
  defaultLocale: keyof I18nLocaleKeyset<T>
) {
  const useI18n = () => {
    const locale = useLocaleLocator(Object.keys(localeKeyset), defaultLocale);

    return computed(() => (key: T, params?: I18nParams) => {
      const keyset = localeKeyset[locale.value];
      if (!keyset) {
        throw new Error(`No locale for "${locale.value}"`);
      }
      const message = keyset[key] || key;

      return formatter(locale.value, message, params);
    }).value;
  };

  const parseMessage = (key: T, locale: string): Array<I18nRawChunk> => {
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
        type: String as unknown as PropType<T>,
        required: true,
      },
    },
    setup(props, ctx) {
      if (!ctx.slots.default) {
        return null;
      }
      const children = ctx.slots.default();

      return () => {
        const locale = useLocaleLocator(Object.keys(localeKeyset), defaultLocale);

        const parsed = parseMessage(props.msg as T, locale.value);

        return parsed.map((chunk) => {
          if (chunk.type === "text") {
            return formatter(locale.value, chunk.value);
          }

          return children[chunk.index];
        });
      };
    },
  });

  return { Component, useI18n };
}

export * from "./types";
