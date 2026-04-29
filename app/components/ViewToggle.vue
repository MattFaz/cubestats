<script setup lang="ts">
const model = defineModel<'cards' | 'compact'>({ default: 'cards' })
</script>

<template>
  <div class="flex gap-1 bg-white dark:bg-gray-900 rounded-lg p-1">
    <button
      @click="model = 'cards'"
      class="px-3 py-1 rounded text-xs font-medium transition-colors"
      :class="model === 'cards' ? 'bg-primary text-gray-950' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
    >
      Cards
    </button>
    <button
      @click="model = 'compact'"
      class="px-3 py-1 rounded text-xs font-medium transition-colors"
      :class="model === 'compact' ? 'bg-primary text-gray-950' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
    >
      Compact
    </button>
  </div>
</template>
