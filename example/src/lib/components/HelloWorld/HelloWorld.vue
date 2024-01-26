<script setup lang="ts">
import { ref } from "vue";
import { useOddEven } from "../../composables/useOddEven";
import { useCounter } from "../../composables/useCounter";
import { useGreeting } from "../../composables/useGreeting";
import UserCard from "../UserCard/UserCard.vue";
import { t } from "./locales";

defineProps<{ title: string }>();

const name = ref("");

const users = ref<Array<{
  firstName: string;
  lastName: string;
  birthday: Date;
  points: number;
}>>([]);

const { counter } = useCounter(0);
const num = useOddEven(counter);
const greeting = useGreeting(name);

const addUser = (event: Event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  
  users.value.push({
    birthday: new Date(formData.get("birthday") as string),
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    points: Math.round(Math.random() * 1000),
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="top">
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <p>
        {{ t("i18n サンプル アプリケーションへようこそ" /* HelloWorld title */) }}
      </p>
    </div>
  
    <div class="flex items-center gap-4 bg-indigo-100 p-4">
      <button class="bg-gray-400 p-2 text-white" @click="counter++">{{ t("カウントアップ") }}</button>
      <p>{{ t("カウンター" /* Counter label */) }}: <span class="font-bold">{{ counter }}</span></p>
      <p>{{ t("奇数・偶数" /* Counter odd/even label */) }}: {{ num }}</p>
    </div>
  
    <div class="greeting">
      <input type="text" v-model="name">
      <div>{{ greeting }}</div>
    </div>

    <div class="users">
      <form @submit="addUser" class="flex gap-2">
        <input class="border border-gray-400 px-3 py-1" name="firstName" required :placeholder="t('名前').value" />
        <input class="border border-gray-400 px-3 py-1" name="lastName" required :placeholder="t('苗字').value" />
        <input class="border border-gray-400 px-3 py-1" name="birthday" required type="date" :placeholder="t('誕生日').value" />
        <button class="bg-gray-400 text-white p-2" type="submit">{{ t("ユーザーを追加する") }}</button>
      </form>
    
      <ul>
        <li v-for="(user, idx) in users" :key="idx">
          <UserCard :first-name="user.firstName" :last-name="user.lastName" :birthday="user.birthday" :points="user.points" />
        </li>
      </ul>
    </div>
  
  </div>
</template>
