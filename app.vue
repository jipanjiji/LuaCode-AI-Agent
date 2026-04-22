<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useChatStore } from '~/stores/chat'

const settings = useSettingsStore()
const chat = useChatStore()

onMounted(() => {
  settings.initialize()
  chat.initialize()
})
</script>
