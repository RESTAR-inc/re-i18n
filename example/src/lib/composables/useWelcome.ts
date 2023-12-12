import { computed, type Ref } from "vue";
import { t } from "./locales";

export const useWelcome = (name: Ref<string>, hours: Ref<number>) => {
  const hoursLabel = computed(() => {
    return hours.value % 2 === 0
      ? t("偶数" /* Label for useWelcome */)
      : t("奇数" /* Label for useWelcome */);
  });

  const greeting = computed(() => {
    if (hours.value >= 0 && hours.value < 12) {
      return t("おはよう{name}さん" /* Good Morning in useGreeting */, { name: name.value });
    } else if (hours.value >= 12 && hours.value < 18) {
      return t("こんにちは{name}さん", { name: name.value });
    } else {
      return t("こんばんは{name}さん", { name: name.value });
    }
  });

  return { hoursLabel, greeting };
};
