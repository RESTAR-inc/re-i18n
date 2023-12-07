import { computed, type Ref } from "vue";

import { t } from "./composables.i18n";

export const useGreeting = (name: Ref<string>) => {
  return computed(() => {
    return t("おはよう{name}さん", {
      name: name.value,
    });
  });
};
