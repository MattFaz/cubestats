<script setup lang="ts">
const route = useRoute()
const showSidebar = computed(() => route.path !== '/login')
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white" :class="showSidebar ? 'flex' : ''">
    <AppSidebar v-if="showSidebar" />
    <main class="flex-1 min-w-0 p-6">
      <NuxtPage />
    </main>
  </div>
</template>
