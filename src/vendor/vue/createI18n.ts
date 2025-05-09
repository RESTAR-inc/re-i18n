import { computed, defineComponent, Fragment, h, type PropType } from "vue";
import { normalizeKey } from "../../common.js";
import type { I18nFormatter, I18nLocaleKeyset, I18nParams, I18nRawChunk } from "../../types.js";
import type { UseLocaleLocator } from "./types.js";

export function createI18n<L extends string, K extends string>(
  localeKeyset: I18nLocaleKeyset<L, K>,
  formatter: I18nFormatter<L>,
  useLocaleLocator: UseLocaleLocator<L>,
  defaultLocale: L
) {
  const locale = useLocaleLocator(Object.keys(localeKeyset) as L[], defaultLocale);

  const keyset = computed(() => {
    const value = localeKeyset[locale.value];
    if (!value) {
      throw new Error(`No locale found for "${locale.value}"`);
    }
    return value;
  });

  const t = (key: K, params?: I18nParams) => {
    const message = keyset.value[key] || key;
    return formatter(locale.value, message, params);
  };

  const useReI18n = (key: K, params?: I18nParams) => computed(() => t(key, params));

  const translate = (key: K, params?: I18nParams) => t(key, params);
  translate.$ = useReI18n;

  const parseMessage = (key: K): Array<I18nRawChunk> => {
    const result: Array<I18nRawChunk> = [];
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
      as: {
        type: String as PropType<string>,
        default: undefined,
      },
    },
    setup(props, ctx) {
      return () => {
        if (ctx.slots.default == null) {
          return null;
        }

        const children = ctx.slots.default();
        const key = normalizeKey(props.msg as string) as K;
        const messages = parseMessage(key);

        const childNodes = messages.map((chunk) =>
          chunk.type === "text"
            ? h(Fragment, [formatter(locale.value, chunk.value)])
            : children[chunk.index]
        );

        return props.as != null ? h(props.as, ctx.attrs, childNodes) : h(Fragment, childNodes);
      };
    },
  });

  return { Component, useReI18n, locale, translate };
}
