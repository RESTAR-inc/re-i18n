<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <h1>{{ title }}</h1>
  <p>
    {{ t("Welcome to the i18n example application") }}
  </p>
</template>
