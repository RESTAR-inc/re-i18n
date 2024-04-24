<script setup lang="ts">
import HelloWorld from "../../../lib/components/HelloWorld/HelloWorld.vue";
import PageTitle from "../../../lib/components/PageTitle/PageTitle.vue";
import LangSwitcher from "../../../lib/components/LangSwitcher/LangSwitcher.vue";
import { t, ReI18n, useReI18n } from "./locales";

const STATIC_MESSAGE_1 = t("静的メッセージ　１");
const STATIC_MESSAGE_2 = useReI18n("静的メッセージ　２");
const STATIC_MESSAGE_3 = t.$("静的メッセージ　３"); // Same as `useReI18n`
const STATIC_MESSAGE_4 = {
  msg: useReI18n("静的メッセージ　４"),
}
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
    <div class="bg-indigo-100 p-4 grid grid-cols-[auto_auto_1fr] gap-x-4">
      <span class="font-bold">Method</span>
      <span class="font-bold">Type</span>
      <span class="font-bold">Result</span>

      <span>t</span>
      <span>string</span>
      <h3>{{ STATIC_MESSAGE_1 }}</h3>

      <span>useReI18n</span>
      <span>{{ "ComputedRef<string>" }}</span>
      <h3>{{ STATIC_MESSAGE_2 }}</h3>

      <span>t.$</span>
      <span>{{ "ComputedRef<string>" }}</span>
      <h3>{{ STATIC_MESSAGE_3 }}</h3>

      <span>t.$ nested</span>
      <span>{{ "ComputedRef<string>" }} unwrapped</span>
      <h3>{{ STATIC_MESSAGE_4.msg.value }}</h3>
    </div>
    <div class="bg-gray-200 flex gap-2 flex-wrap items-center p-4">
      <ReI18n msg="赤い：{0}　緑：{1}　青い：{2}">
        <div class="bg-red-400 w-10 h-10 rounded-full"></div>
        <div class="bg-green-400 w-10 h-10 rounded-full"></div>
        <div class="bg-blue-400 w-10 h-10 rounded-full"></div>
      </ReI18n>
    </div>

    <div class="bg-gray-200 flex gap-2 flex-wrap items-center p-4">
      <ReI18n msg="赤い：{0}, 緑：{1}, 青い：{2}">
        <div class="bg-red-400 w-10 h-10 rounded-full text-xs flex items-center justify-center">
          {{ t("一番") }}
        </div>
        <div class="bg-green-400 w-10 h-10 rounded-full text-xs flex items-center justify-center">
          {{ t("二番") }}
        </div>
        <div class="bg-blue-400 w-10 h-10 rounded-full text-xs flex items-center justify-center">
          {{ t("三番") }}
        </div>
      </ReI18n>
    </div>

    <HelloWorld :title="t('こんにちは世界')" />
  </main>
</template>
