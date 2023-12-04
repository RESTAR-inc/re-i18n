<script setup lang="ts">
import { t } from "./HelloWorld.i18n";

defineProps<{ title: string }>();
</script>

<template>
  <h1>{{ title }}</h1>
  <p>
    {{ t("i18n サンプル アプリケーションへようこそ") }}
  </p>
</template>
