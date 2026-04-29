<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string | number | null | undefined
  subtitle?: string
  goal?: number | null
}>()

const goalStatus = computed(() => {
  if (!props.goal || typeof props.value !== 'number' || props.value === null || props.value === -1) {
    return null
  }
  if (props.value <= props.goal) return 'achieved'
  if (props.value <= props.goal * 1.1) return 'close'
  return 'pending'
})

const goalSubtitle = computed(() => {
  if (!props.goal) return props.subtitle
  if (goalStatus.value === 'achieved') return 'Goal reached!'
  if (goalStatus.value === 'close') return 'Almost there!'
  return `Goal: ${formatTime(props.goal)}`
})

const borderClass = computed(() => {
  if (goalStatus.value === 'achieved') return 'border-green-500 dark:border-green-500'
  if (goalStatus.value === 'close') return 'border-yellow-500 dark:border-yellow-500'
  return 'border-gray-200 dark:border-gray-800'
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 border rounded-xl p-4"
    :class="borderClass"
  >
    <p class="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{{ label }}</p>
    <p class="text-2xl font-bold mt-1">
      {{ typeof value === 'number' ? formatTime(value) : value ?? '—' }}
    </p>
    <p v-if="goalSubtitle" class="text-xs mt-1" :class="{
      'text-green-500': goalStatus === 'achieved',
      'text-yellow-500': goalStatus === 'close',
      'text-gray-400 dark:text-gray-500': !goalStatus || goalStatus === 'pending',
    }">{{ goalSubtitle }}</p>
  </div>
</template>
