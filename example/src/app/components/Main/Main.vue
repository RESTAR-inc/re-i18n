<script setup lang="ts">
import HelloWorld from "../../../lib/components/HelloWorld/HelloWorld.vue";
import { t } from "./locales";
</script>

<template>
  <h1>re-i18n</h1>
  <HelloWorld :title="t('i18N アプリケーションの例')" />
</template>
