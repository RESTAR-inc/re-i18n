import { computed, ref } from "vue";
import { t } from "./locales";

export const useCounter = (initial: number) => {
  const counter = ref(initial);
  const label = computed(() =>
    counter.value % 2 === 0
      ? t("偶数" /* Label for useCounter */)
      : t("奇数" /* Label for useCounter */)
  );

  return { label, counter };
};
