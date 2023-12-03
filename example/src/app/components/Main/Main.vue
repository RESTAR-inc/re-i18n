<script setup lang="ts">
import HelloWorld from "../../lib/components/HelloWorld/HelloWorld.vue";
</script>

<template>
  <h1>{{ t("Example i18N application") }}</h1>
  <HelloWorld :title="t('Hello, i18n')" />
</template>
