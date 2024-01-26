<script setup lang="ts">
import HelloWorld from "../../../lib/components/HelloWorld/HelloWorld.vue";
import PageTitle from "../../../lib/components/PageTitle/PageTitle.vue";
import LangSwitcher from "../../../lib/components/LangSwitcher/LangSwitcher.vue";
import { t, ReI18n } from "./locales";

const STATIC_MESSAGE = t("静的メッセージ");
</script>

<template>
  
  <header class="bg-blue-200 py-4">
    <div class="container mx-auto grid grid-cols-3 items-center">
      <LangSwitcher />
      <h1 class="text-xl font-bold">{{ t("re-i18n 例") }}</h1>
    </div>
  </header>

  <main class="container mx-auto flex flex-col gap-4">
    <PageTitle />
    <h3>{{ STATIC_MESSAGE }}</h3>
    <div class="bg-indigo-200 flex gap-2 flex-wrap p-8">
      <ReI18n msg="開始 | {0} 最初 {1} 2 番目 {2} 3 番目 {0} 最初 {2} 3 番目 {3} 最後 {1} 2 番目 {2} 3 番目 {0} 最初 | 終わり">
        <a class="underline font-bold" href="#">Link</a>
        <div>{{ t("二番") }}</div>
        <b class="font-bold">THIRD</b>
        <img alt="FOURTH" src="https://placehold.jp/50x50.png" />
      </ReI18n>
    </div>
    <HelloWorld :title="t('こんにちは世界').value" />
  </main>
</template>
