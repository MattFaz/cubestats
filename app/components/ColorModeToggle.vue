<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')
const icon = computed(() => isDark.value ? 'i-lucide-moon' : 'i-lucide-sun')
const label = computed(() => isDark.value ? 'Dark mode' : 'Light mode')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <ClientOnly>
    <button
      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
      :title="label"
      @click="toggle"
    >
      <UIcon :name="icon" class="w-5 h-5 shrink-0" />
      <span class="truncate">{{ label }}</span>
    </button>
    <template #fallback>
      <div class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 w-full">
        <span class="w-5 h-5 shrink-0" />
        <span class="truncate">Theme</span>
      </div>
    </template>
  </ClientOnly>
</template>
