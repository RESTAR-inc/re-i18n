<script setup lang="ts">
import { computed } from 'vue';

const today = computed(() => new Date().toUTCString());
</script>

<template>
  <h1>This file doesn't use i18n</h1>
  <h3>{{ today }}</h3>
</template>