import type { UseLocaleLocator } from "re-i18n/lib/vendor/vue";
import { computed, ref } from "vue";

const innerLocale = ref("ja");

const useLocaleLocator: UseLocaleLocator = (locales, defaultLocale) => {
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
