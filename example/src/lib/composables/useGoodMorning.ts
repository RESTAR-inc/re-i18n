import { computed, type Ref } from "vue";

import { t } from "./composables.i18n";

export const useGoodMorning = (name: Ref<string>) => {
  return computed(() =>
    t("おはよう{name}さん", {
      name: name.value,
    })
  );
};
