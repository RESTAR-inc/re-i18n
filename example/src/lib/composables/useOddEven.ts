import { computed, type Ref } from "vue";
import { t } from "./locales";

export const useOddEven = (num: Ref<number>) => {
  return computed(() => {
    return num.value % 2 === 0
      ? t("偶数" /* Label for useOddEven */)
      : t("奇数" /* Label for useOddEven */);
  });
};
