<script setup lang="ts">
import { ref } from "vue";
import { useOddEven } from "../../composables/useOddEven";
import { t } from "./HelloWorld.i18n";

defineProps<{ title: string }>();

const counter = ref(0);

const num = useOddEven(counter);
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
</template>
