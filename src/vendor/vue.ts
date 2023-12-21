import { defineComponent, type PropType } from "vue";
import { resolveLocale, resolveMessage } from "../resolvers";
import type { I18nFormatter, I18nGetLocale, I18nLocaleKeyset, I18nRawChunk } from "../types";

export function createComponent<T extends string>(
  localeKeyset: I18nLocaleKeyset<T>,
  formatter: I18nFormatter,
  getLocale: I18nGetLocale<keyof I18nLocaleKeyset<T>>,
  defaultLocale: string
) {
  function parseMessage(key: T, locale: string): Array<I18nRawChunk> {
    const message = resolveMessage(key, locale, localeKeyset);

    const result: Array<I18nRawChunk> = [];
    let lastIndex = 0;

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
  }

  return defineComponent({
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

      // TODO: go reactive
      const locale = resolveLocale(localeKeyset, getLocale, defaultLocale);
      const parsed = parseMessage(props.msg as T, locale);
      const children = ctx.slots.default();

      return () =>
        parsed.map((chunk) => {
          if (chunk.type === "text") {
            return formatter(locale, chunk.value);
          }

          return children[chunk.index];
        });
    },
  });
}
