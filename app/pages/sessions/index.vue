<script setup lang="ts">
const { currentPuzzle, PUZZLE_TYPES } = usePuzzleFilter()

const { data: sessions, refresh } = useFetch('/api/sessions', {
  query: computed(() => {
    const params: Record<string, string> = {}
    if (currentPuzzle.value) params.puzzle_type = currentPuzzle.value
    return params
  }),
  watch: [currentPuzzle],
})

function puzzleLabel(value: string): string {
  return PUZZLE_TYPES.find(p => p.value === value)?.label ?? value
}
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-6">Sessions</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink v-for="session in sessions" :key="session.id" :to="`/sessions/${session.id}`"
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold">{{ session.displayName }}</h3>
          <span class="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">{{ puzzleLabel(session.puzzleType) }}</span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ session.solveCount }} solves</p>
        <p class="text-lg font-mono font-bold mt-2 text-primary">
          {{ session.bestTime ? `${(session.bestTime / 1000).toFixed(2)}s` : '—' }}
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500">Best single</p>
      </NuxtLink>
    </div>
    <p v-if="sessions?.length === 0" class="text-gray-400 dark:text-gray-500 text-center py-12">No sessions yet. Import your cstimer data to get started.</p>
  </div>
</template>
