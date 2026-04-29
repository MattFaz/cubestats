<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  TimeScale,
  Legend,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, TimeScale, Legend)

const { chartColors } = useChartTheme()
const colorMode = useColorMode()

const { currentPuzzle } = usePuzzleFilter()

// Session filter for rolling averages
const sessionFilter = ref<number | null>(null)
const { data: sessions } = useFetch('/api/sessions')

// Rolling average data
const { data: trendsData } = useFetch('/api/solves/trends', {
  query: computed(() => {
    const params: Record<string, string> = {}
    if (sessionFilter.value) params.session_id = String(sessionFilter.value)
    if (currentPuzzle.value) params.puzzle_type = currentPuzzle.value
    return params
  }),
  watch: [sessionFilter, currentPuzzle],
})

const ao5Data = computed(() => trendsData.value?.ao5 ?? [])
const ao12Data = computed(() => trendsData.value?.ao12 ?? [])

// Session comparison
const sessionA = ref<number | null>(null)
const sessionB = ref<number | null>(null)

const { data: statsA } = useFetch('/api/solves/stats', {
  query: computed(() => {
    const params: Record<string, string> = {}
    if (sessionA.value) params.session_id = String(sessionA.value)
    if (currentPuzzle.value) params.puzzle_type = currentPuzzle.value
    return params
  }),
  watch: [sessionA, currentPuzzle],
  immediate: false,
})

const { data: statsB } = useFetch('/api/solves/stats', {
  query: computed(() => {
    const params: Record<string, string> = {}
    if (sessionB.value) params.session_id = String(sessionB.value)
    if (currentPuzzle.value) params.puzzle_type = currentPuzzle.value
    return params
  }),
  watch: [sessionB, currentPuzzle],
  immediate: false,
})

// Weekly comparison
const { data: weekly } = useFetch('/api/solves/weekly', {
  query: computed(() => {
    const params: Record<string, string> = {}
    if (currentPuzzle.value) params.puzzle_type = currentPuzzle.value
    return params
  }),
  watch: [currentPuzzle],
})

// Chart data
const chartData = computed(() => ({
  datasets: [
    {
      label: 'Ao5',
      data: ao5Data.value.map((d: { solvedAt: string; average: number }) => ({
        x: new Date(d.solvedAt).getTime(),
        y: d.average / 1000,
      })),
      borderColor: 'rgba(34, 197, 94, 0.8)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      pointRadius: 2,
      borderWidth: 2,
      tension: 0.3,
      fill: false,
    },
    {
      label: 'Ao12',
      data: ao12Data.value.map((d: { solvedAt: string; average: number }) => ({
        x: new Date(d.solvedAt).getTime(),
        y: d.average / 1000,
      })),
      borderColor: 'rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointRadius: 2,
      borderWidth: 2,
      tension: 0.3,
      fill: false,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    x: {
      type: 'time' as const,
      grid: { color: chartColors.value.grid },
      ticks: { color: chartColors.value.tick },
    },
    y: {
      title: { display: true, text: 'Time (s)', color: chartColors.value.tick },
      grid: { color: chartColors.value.grid },
      ticks: { color: chartColors.value.tick },
    },
  },
  plugins: {
    legend: {
      labels: { color: chartColors.value.tick },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number }; dataset: { label?: string } }) => {
          const ms = Math.round(ctx.parsed.y * 1000)
          return `${ctx.dataset.label}: ${formatTime(ms)}`
        },
      },
    },
  },
}))

// Comparison helpers
interface CompareRow {
  label: string
  valueA: number | null | undefined
  valueB: number | null | undefined
  lower: boolean // true = lower is better
}

const comparisonRows = computed<CompareRow[]>(() => {
  if (!statsA.value || !statsB.value) return []
  return [
    { label: 'Personal Best', valueA: statsA.value.pb, valueB: statsB.value.pb, lower: true },
    { label: 'Best Ao5', valueA: statsA.value.bestAo5, valueB: statsB.value.bestAo5, lower: true },
    { label: 'Best Ao12', valueA: statsA.value.bestAo12, valueB: statsB.value.bestAo12, lower: true },
    { label: 'Best Ao100', valueA: statsA.value.bestAo100, valueB: statsB.value.bestAo100, lower: true },
    { label: 'Total Solves', valueA: statsA.value.totalSolves, valueB: statsB.value.totalSolves, lower: false },
  ]
})

function betterClass(row: CompareRow, side: 'a' | 'b'): string {
  const a = row.valueA
  const b = row.valueB
  if (a == null || b == null || a === -1 || b === -1) return ''
  if (a === b) return ''
  const aWins = row.lower ? a < b : a > b
  if (side === 'a' && aWins) return 'text-green-500'
  if (side === 'b' && !aWins) return 'text-green-500'
  return ''
}

// Weekly helpers
function pctChange(current: number | null, previous: number | null): string | null {
  if (current == null || previous == null || previous === 0) return null
  const pct = ((current - previous) / previous) * 100
  return pct.toFixed(1)
}

function improvementClass(current: number | null, previous: number | null, lowerIsBetter: boolean): string {
  if (current == null || previous == null) return ''
  if (current === previous) return ''
  const improved = lowerIsBetter ? current < previous : current > previous
  return improved ? 'text-green-500' : 'text-red-400'
}

function improvementArrow(current: number | null, previous: number | null, lowerIsBetter: boolean): string {
  if (current == null || previous == null) return ''
  if (current === previous) return ''
  const improved = lowerIsBetter ? current < previous : current > previous
  return improved ? '\u2191' : '\u2193'
}

interface WeeklyCard {
  label: string
  thisWeek: number | null
  lastWeek: number | null
  lowerIsBetter: boolean
  isTime: boolean
}

const weeklyCards = computed<WeeklyCard[]>(() => {
  if (!weekly.value) return []
  const tw = weekly.value.thisWeek
  const lw = weekly.value.lastWeek
  return [
    { label: 'Average Time', thisWeek: tw.avgMs, lastWeek: lw.avgMs, lowerIsBetter: true, isTime: true },
    { label: 'Total Solves', thisWeek: tw.totalSolves, lastWeek: lw.totalSolves, lowerIsBetter: false, isTime: false },
    { label: 'Best Single', thisWeek: tw.bestSingle, lastWeek: lw.bestSingle, lowerIsBetter: true, isTime: true },
    { label: 'Best Ao5', thisWeek: tw.bestAo5, lastWeek: lw.bestAo5, lowerIsBetter: true, isTime: true },
  ]
})

function displayVal(val: number | null, isTime: boolean): string {
  if (val == null) return '\u2014'
  return isTime ? formatTime(val) : String(val)
}
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-6">Trends</h2>

    <!-- Section A: Rolling Averages Chart -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold">Rolling Averages</h3>
        <USelect
          v-model="sessionFilter"
          :items="[{ label: 'All Sessions', value: null }, ...(sessions || []).map((s: { id: number; displayName: string }) => ({ label: s.displayName, value: s.id }))]"
          placeholder="All Sessions"
          class="w-48"
        />
      </div>
      <div class="h-72">
        <Line :key="colorMode.value" :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Section B: Session Comparison -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6">
      <h3 class="text-sm font-semibold mb-4">Session Comparison</h3>
      <div class="flex gap-4 mb-4">
        <USelect
          v-model="sessionA"
          :items="(sessions || []).map((s: { id: number; displayName: string }) => ({ label: s.displayName, value: s.id }))"
          placeholder="Select session"
          class="w-48"
        />
        <span class="self-center text-gray-400 dark:text-gray-500 font-medium">vs</span>
        <USelect
          v-model="sessionB"
          :items="(sessions || []).map((s: { id: number; displayName: string }) => ({ label: s.displayName, value: s.id }))"
          placeholder="Select session"
          class="w-48"
        />
      </div>

      <div v-if="statsA && statsB" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-800">
              <th class="text-left py-2 text-gray-400 dark:text-gray-500 font-medium">Metric</th>
              <th class="text-right py-2 text-gray-400 dark:text-gray-500 font-medium">Session A</th>
              <th class="text-right py-2 text-gray-400 dark:text-gray-500 font-medium">Session B</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in comparisonRows" :key="row.label" class="border-b border-gray-100 dark:border-gray-800/50">
              <td class="py-2 text-gray-600 dark:text-gray-300">{{ row.label }}</td>
              <td class="py-2 text-right font-mono" :class="betterClass(row, 'a')">
                {{ row.label === 'Total Solves' ? (row.valueA ?? '\u2014') : formatTime(row.valueA ?? null) }}
              </td>
              <td class="py-2 text-right font-mono" :class="betterClass(row, 'b')">
                {{ row.label === 'Total Solves' ? (row.valueB ?? '\u2014') : formatTime(row.valueB ?? null) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-400 dark:text-gray-500 text-sm">Select two sessions to compare.</p>
    </div>

    <!-- Section C: This Week vs Last Week -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <h3 class="text-sm font-semibold mb-4">This Week vs Last Week</h3>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="card in weeklyCards"
          :key="card.label"
          class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
        >
          <div class="text-xs text-gray-400 dark:text-gray-500 mb-1">{{ card.label }}</div>
          <div class="flex items-baseline gap-2">
            <span class="text-lg font-semibold font-mono">{{ displayVal(card.thisWeek, card.isTime) }}</span>
            <span
              v-if="pctChange(card.thisWeek, card.lastWeek)"
              class="text-xs font-medium"
              :class="improvementClass(card.thisWeek, card.lastWeek, card.lowerIsBetter)"
            >
              {{ improvementArrow(card.thisWeek, card.lastWeek, card.lowerIsBetter) }}
              {{ Math.abs(Number(pctChange(card.thisWeek, card.lastWeek))) }}%
            </span>
          </div>
          <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Last week: {{ displayVal(card.lastWeek, card.isTime) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
