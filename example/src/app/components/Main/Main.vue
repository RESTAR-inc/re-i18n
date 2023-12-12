<script setup lang="ts">
import HelloWorld from "../../../lib/components/HelloWorld/HelloWorld.vue";
import PageTitle from "../../../lib/components/PageTitle/PageTitle.vue";
import { t } from "./locales";
</script>

<template>
  <h1>{{ t("i18N アプリケーションの例") }}</h1>
  <PageTitle />
  <HelloWorld :title="t('こんにちは世界')" />
</template>
