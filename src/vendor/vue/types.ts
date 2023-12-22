import type { WritableComputedRef } from "vue";

export type UseLocaleLocator = (
  locales: Array<string>,
  defaultLocale: string
) => WritableComputedRef<string>;
