import type { UseLocaleLocator } from "@restar-inc/re-i18n/lib/vendor/vue";
import { computed, ref } from "vue";
import type { Locale } from "./types";

const innerLocale = ref<Locale>("ja");

const useLocaleLocator: UseLocaleLocator<Locale> = (locales, defaultLocale) => {
  return computed({
    get: () => innerLocale.value,
    set: (value) => {
      if (locales.includes(value)) {
        innerLocale.value = value;
      } else {
        innerLocale.value = defaultLocale;
      }
    },
  });
};

export default useLocaleLocator;
