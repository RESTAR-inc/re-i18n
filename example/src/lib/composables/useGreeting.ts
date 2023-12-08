import { computed, type Ref } from "vue";
import { t } from "./composables.i18n";

export const useGreeting = (name: Ref<string>) => {
  return computed(() => {
    const date = new Date();
    const hours = date.getHours();

    if (hours >= 0 && hours < 12) {
      return t("おはよう{name}さん", { name: name.value });
    } else if (hours >= 12 && hours < 18) {
      return t("こんにちは{name}さん", { name: name.value });
    } else {
      return t("こんばんは{name}さん", { name: name.value });
    }
  });
};
