<script setup lang="ts">
import { computed } from 'vue';
import { t } from "./locales";

const props = defineProps<{
  firstName: string;
  lastName: string;
  birthday: Date;
  points: number;
}>();

const formatted = computed(() => {
  return t("名前：　{lastName} {firstName}。誕生日：　{birthday}。ポイント：　{points}", {
    firstName: props.firstName,
    lastName: props.lastName,
    birthday: props.birthday,
    points: props.points,
  });
});
</script>

<template>
  <div>{{ formatted }}</div>
</template>
