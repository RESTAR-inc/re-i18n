import type { WritableComputedRef } from "vue";

export type UseLocaleLocator<T extends string> = (
  locales: Array<T>,
  defaultLocale: T
) => WritableComputedRef<T>;
