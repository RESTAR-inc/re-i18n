<script setup lang="ts">
const props = defineProps<{}>();
</script>

<template>
  <h1>{{ t("ページタイトル" /* test comment */) }}</h1>
  <div>
    <slot />
  </div>
</template>
