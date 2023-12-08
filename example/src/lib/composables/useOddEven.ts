import { computed, type Ref } from "vue";
import { t } from "./composables.i18n";

export const useOddEven = (num: Ref<number>) => {
  return computed(() => {
    return num.value % 2 === 0 ? t("偶数") : t("奇数");
  });
};
