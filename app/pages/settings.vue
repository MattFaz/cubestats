<script setup lang="ts">
const { data: goals, refresh: refreshGoals } = useGoals()

const allMetricOptions = [
  { label: 'Personal Best', value: 'pb' },
  { label: 'Average of 5', value: 'ao5' },
  { label: 'Average of 12', value: 'ao12' },
  { label: 'Average of 100', value: 'ao100' },
]

const metricOptions = computed(() => {
  const existingMetrics = new Set(goals.value?.map(g => g.metric) ?? [])
  return allMetricOptions.filter(o => !existingMetrics.has(o.value))
})

const newMetric = ref('pb')
const newTargetSeconds = ref<string>('')
const errorMessage = ref<string | null>(null)

function metricLabel(metric: string): string {
  return allMetricOptions.find(m => m.value === metric)?.label ?? metric
}

async function addGoal() {
  const seconds = parseFloat(newTargetSeconds.value)
  if (isNaN(seconds) || seconds <= 0) return
  errorMessage.value = null

  try {
    await $fetch('/api/goals', {
      method: 'POST',
      body: {
        metric: newMetric.value,
        targetMs: Math.round(seconds * 1000),
      },
    })
    newTargetSeconds.value = ''
    await refreshGoals()
  } catch (err) {
    console.error('Failed to add goal:', err)
    errorMessage.value = 'Failed to add goal. Please try again.'
  }
}

async function deleteGoal(id: number) {
  errorMessage.value = null
  try {
    await $fetch(`/api/goals/${id}`, { method: 'DELETE' })
    await refreshGoals()
  } catch (err) {
    console.error('Failed to delete goal:', err)
    errorMessage.value = 'Failed to delete goal. Please try again.'
  }
}
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-6">Settings</h2>

    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <h3 class="text-lg font-semibold mb-4">Goals</h3>

      <div v-if="goals?.length" class="space-y-3 mb-6">
        <div
          v-for="goal in goals"
          :key="goal.id"
          class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3"
        >
          <div>
            <span class="font-medium">{{ metricLabel(goal.metric) }}</span>
            <span class="text-gray-400 dark:text-gray-500 mx-2">&mdash;</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ formatTime(goal.targetMs) }}</span>
          </div>
          <UButton
            color="error"
            variant="ghost"
            size="xs"
            icon="i-heroicons-trash"
            @click="deleteGoal(goal.id)"
          />
        </div>
      </div>
      <p v-else class="text-gray-500 dark:text-gray-400 text-sm mb-6">No goals set yet.</p>

      <div class="flex items-end gap-3">
        <div class="flex-1">
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Metric</label>
          <USelect v-model="newMetric" :items="metricOptions" class="w-full" />
        </div>
        <div class="flex-1">
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Target (seconds)</label>
          <UInput
            v-model="newTargetSeconds"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 20.00"
            class="w-full"
            @keyup.enter="addGoal"
          />
        </div>
        <UButton @click="addGoal" :disabled="!newTargetSeconds || metricOptions.length === 0">Add Goal</UButton>
      </div>

      <p v-if="errorMessage" class="text-red-500 text-sm mt-3">{{ errorMessage }}</p>
    </div>
  </div>
</template>
