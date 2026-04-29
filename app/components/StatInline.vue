<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number | null | undefined
}>()

function formatTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—'
  if (ms === -1) return 'DNF'
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toFixed(2)
  return minutes > 0 ? `${minutes}:${seconds.padStart(5, '0')}` : seconds
}
</script>

<template>
  <span>
    <span class="text-gray-400 dark:text-gray-500">{{ label }}</span>
    <span class="font-mono font-semibold ml-1">{{ formatTime(value) }}</span>
  </span>
</template>
