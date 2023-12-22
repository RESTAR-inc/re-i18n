<script setup lang="ts">
import HelloWorld from "../../../lib/components/HelloWorld/HelloWorld.vue";
import PageTitle from "../../../lib/components/PageTitle/PageTitle.vue";
import LangSwitcher from "../../../lib/components/LangSwitcher/LangSwitcher.vue";
import { t, ReI18n } from "./locales";
</script>

<template>
  <LangSwitcher />
  <h1>{{ t("re-i18n 例") }}</h1>
  <PageTitle />
  <ReI18n msg="開始 | {0} 最初 {1} 2 番目 {2} 3 番目 {0} 最初 {2} 3 番目 {3} 最後 {1} 2 番目 {2} 3 番目 {0} 最初 | 終わり">
    <a href="#">FIRST</a>
    <span>{{ t("二番") }}</span>
    <b>THIRD</b>
    <img alt="FOURTH" src="https://placehold.jp/50x50.png" />
  </ReI18n>
  <HelloWorld :title="t('こんにちは世界')" />
</template>
