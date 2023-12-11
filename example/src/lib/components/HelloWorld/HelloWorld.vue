<script setup lang="ts">
import { ref } from "vue";
import { useOddEven } from "../../composables/useOddEven";
import { t } from "./locales";
import { useGoodMorning } from "../../composables/useGoodMorning";

defineProps<{ title: string }>();

const counter = ref(0);

const name = ref("");

const num = useOddEven(counter);

const goodMorning = useGoodMorning(name);

</script>

<template>
  <h1>{{ title }}</h1>
  <p>
    {{ t("i18n サンプル アプリケーションへようこそ" /* HelloWorld title */) }}
  </p>
  <div>
    <button @click="counter++">{{ t("カウントアップ") }}</button>
    <p>{{ t("カウンター") }}: {{ counter }}</p>
    <p>{{ t("奇数・偶数") }}: {{ num }}</p>
  </div>

  <div>
    <input type="text" v-model="name">
    <div>{{ goodMorning }}</div>
  </div>
</template>
