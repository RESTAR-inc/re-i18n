import { computed, type Ref } from "vue";
import { t } from "./locales";

export const useGoodMorning = (name: Ref<string>) => {
  return computed(() =>
    t("おはよう{name}さん" /* Good Morning in useGoodMorning */, {
      name: name.value,
    })
  );
};
