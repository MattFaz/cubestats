<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const props = defineProps<{
  solves: any[]
}>()

const { chartColors } = useChartTheme()
const colorMode = useColorMode()

const filteredSolves = computed(() =>
  [...props.solves]
    .filter(s => s.penalty !== 'dnf')
    .sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime())
)

const chartData = computed(() => ({
  labels: filteredSolves.value.map((_s, i) => `#${i + 1}`),
  datasets: [{
    label: 'Solve Time',
    data: filteredSolves.value.map(s =>
      (s.penalty === 'plus2' ? s.timeMs + 2000 : s.timeMs) / 1000
    ),
    borderColor: chartColors.value.point,
    backgroundColor: chartColors.value.point.replace(/[\d.]+\)$/, '0.1)'),
    pointBackgroundColor: chartColors.value.point,
    pointRadius: 4,
    pointHoverRadius: 6,
    borderWidth: 2,
    fill: true,
    tension: 0.3,
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { color: chartColors.value.grid },
      ticks: { color: chartColors.value.tick, maxTicksLimit: 15 },
    },
    y: {
      title: { display: true, text: 'Time (s)', color: chartColors.value.tick },
      grid: { color: chartColors.value.grid },
      ticks: {
        color: chartColors.value.tick,
        callback: (value: number) => {
          const min = Math.floor(value / 60)
          const sec = (value % 60).toFixed(0)
          return min > 0 ? `${min}:${sec.padStart(2, '0')}` : `${value}s`
        },
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        title: (items: any[]) => {
          const idx = items[0]?.dataIndex
          if (idx == null) return ''
          const solve = filteredSolves.value[idx]
          return new Date(solve.solvedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
          })
        },
        label: (ctx: any) => {
          const secs = ctx.parsed.y
          const min = Math.floor(secs / 60)
          const sec = (secs % 60).toFixed(2)
          return min > 0 ? `${min}:${sec.padStart(5, '0')}` : `${sec}s`
        },
      },
    },
  },
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
    <h3 class="text-sm font-semibold mb-4">Solve Times</h3>
    <div v-if="filteredSolves.length === 0" class="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
      No solves to display
    </div>
    <div v-else class="h-64">
      <Line :key="colorMode.value" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
