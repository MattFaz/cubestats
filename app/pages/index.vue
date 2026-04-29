<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

interface Goal {
  id: number
  metric: string
  targetMs: number
  createdAt: string
}

const sessionFilter = ref<number | null>(null)
const viewMode = ref<'cards' | 'compact'>('cards')
const { currentPuzzle } = usePuzzleFilter()

const { data: stats } = useStats(sessionFilter, currentPuzzle)
const { data: solvesData } = useSolves({
  sessionId: sessionFilter,
  puzzleType: currentPuzzle,
  limit: ref(20),
  sort: ref('date'),
  dir: ref('desc'),
})
const { data: sessions } = useFetch('/api/sessions')
const { data: goals } = useGoals()

const solves = computed(() => solvesData.value?.solves || [])

function goalForMetric(metric: string): number | null {
  const goal = goals.value?.find((g: Goal) => g.metric === metric)
  return goal ? goal.targetMs : null
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">Dashboard</h2>
      <div class="flex items-center gap-3">
        <USelect
          v-model="sessionFilter"
          :items="[{ label: 'All Sessions', value: null }, ...(sessions || []).map((s: any) => ({ label: s.displayName, value: s.id }))]"
          placeholder="All Sessions"
          class="w-48"
        />
        <ViewToggle v-model="viewMode" />
      </div>
    </div>

    <div v-if="viewMode === 'cards'" class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard label="Personal Best" :value="stats?.pb" :goal="goalForMetric('pb')" />
      <StatCard label="Current Ao5" :value="stats?.currentAo5" :goal="goalForMetric('ao5')" />
      <StatCard label="Current Ao12" :value="stats?.currentAo12" :goal="goalForMetric('ao12')" />
      <StatCard label="Current Ao100" :value="stats?.currentAo100" :goal="goalForMetric('ao100')" />
      <StatCard label="Total Solves" :value="String(stats?.totalSolves ?? 0)" />
    </div>
    <div v-else class="flex items-center gap-6 mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm">
      <StatInline label="PB" :value="stats?.pb" />
      <StatInline label="Ao5" :value="stats?.currentAo5" />
      <StatInline label="Ao12" :value="stats?.currentAo12" />
      <StatInline label="Ao100" :value="stats?.currentAo100" />
      <span class="text-gray-400 dark:text-gray-500">|</span>
      <span class="text-gray-500 dark:text-gray-400">{{ stats?.totalSolves ?? 0 }} solves</span>
    </div>

    <SolveChart :solves="solves" class="mb-6" />

    <div>
      <h3 class="text-sm font-semibold mb-3">Recent Solves</h3>
      <SolveTable :solves="solves" :compact="viewMode === 'compact'" />
    </div>
  </div>
</template>
