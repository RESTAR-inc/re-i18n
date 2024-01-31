<script setup lang=ts>
import { t, locale } from "./locales";
</script>

<template>
  <div class="w-full">
    <button class="bg-gray-400 text-white p-2" v-if="locale === 'en'" @click="locale = 'ja'">{{ t("日本語") }}</button>
    <button class="bg-gray-400 text-white p-2" v-else-if="locale === 'ja'" @click="locale = 'en'">{{ t("English") }}</button>
  </div>
</template>
