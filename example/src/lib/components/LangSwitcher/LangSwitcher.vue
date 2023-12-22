<script setup lang=ts>
import { t, locale } from "./locales";

const changeLocale = (value: "en" | "ja") => {
  locale.value = value;
};
</script>

<template>
  <div class="lang-switcher">
    <button v-if="locale === 'en'" @click="changeLocale('ja')">{{ t("日本語") }}</button>
    <button v-else-if="locale === 'ja'" @click="changeLocale('en')">{{ t("English") }}</button>
  </div>
</template>

<style scoped>
.lang-switcher {
  display: flex;
  gap: 12px;
}
</style>
