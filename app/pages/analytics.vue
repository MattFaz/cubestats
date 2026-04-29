<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const { chartColors } = useChartTheme()
const colorMode = useColorMode()

const { currentPuzzle } = usePuzzleFilter()

// Session filter
const sessionFilter = ref<number | null>(null)
const { data: sessions } = useFetch('/api/sessions')

// Distribution data
const { data: distData } = useFetch('/api/solves/distribution', {
  query: computed(() => {
    const params: Record<string, string> = {}
    if (sessionFilter.value) params.session_id = String(sessionFilter.value)
    if (currentPuzzle.value) params.puzzle_type = currentPuzzle.value
    return params
  }),
  watch: [sessionFilter, currentPuzzle],
})

// Calendar data
const { data: calendarData } = useFetch('/api/solves/calendar', {
  query: computed(() => {
    const params: Record<string, string> = {}
    if (currentPuzzle.value) params.puzzle_type = currentPuzzle.value
    return params
  }),
  watch: [currentPuzzle],
})

// Hourly data
const { data: hourlyData } = useFetch('/api/solves/hourly', {
  query: computed(() => {
    const params: Record<string, string> = {}
    if (sessionFilter.value) params.session_id = String(sessionFilter.value)
    if (currentPuzzle.value) params.puzzle_type = currentPuzzle.value
    return params
  }),
  watch: [sessionFilter, currentPuzzle],
})

// --- Distribution chart ---
const distChartData = computed(() => {
  const buckets = distData.value ?? []
  return {
    labels: buckets.map((b: { bucketStart: number; bucketEnd: number }) =>
      `${(b.bucketStart / 1000).toFixed(0)}-${(b.bucketEnd / 1000).toFixed(0)}s`
    ),
    datasets: [{
      label: 'Solves',
      data: buckets.map((b: { count: number }) => b.count),
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
      borderColor: 'rgba(34, 197, 94, 0.8)',
      borderWidth: 1,
    }],
  }
})

const distChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: { display: true, text: 'Time Range', color: chartColors.value.tick },
      grid: { color: chartColors.value.grid },
      ticks: { color: chartColors.value.tick },
    },
    y: {
      title: { display: true, text: 'Count', color: chartColors.value.tick },
      grid: { color: chartColors.value.grid },
      ticks: { color: chartColors.value.tick, stepSize: 1 },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items: { label: string }[]) => items[0]?.label ?? '',
        label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y} solves`,
      },
    },
  },
}))

// --- Hourly chart ---
const bestHour = computed(() => {
  const hours = hourlyData.value ?? []
  if (hours.length === 0) return -1
  let best = hours[0]
  for (const h of hours) {
    if ((h as { avgMs: number }).avgMs < (best as { avgMs: number }).avgMs) best = h
  }
  return (best as { hour: number }).hour
})

const hourlyChartData = computed(() => {
  const hours = hourlyData.value ?? []
  return {
    labels: hours.map((h: { hour: number }) => `${String(h.hour).padStart(2, '0')}:00`),
    datasets: [{
      label: 'Avg Time',
      data: hours.map((h: { avgMs: number }) => h.avgMs / 1000),
      backgroundColor: hours.map((h: { hour: number }) =>
        h.hour === bestHour.value ? 'rgba(234, 179, 8, 0.7)' : 'rgba(59, 130, 246, 0.6)'
      ),
      borderColor: hours.map((h: { hour: number }) =>
        h.hour === bestHour.value ? 'rgba(234, 179, 8, 0.9)' : 'rgba(59, 130, 246, 0.8)'
      ),
      borderWidth: 1,
    }],
  }
})

const hourlyChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: { display: true, text: 'Hour of Day', color: chartColors.value.tick },
      grid: { color: chartColors.value.grid },
      ticks: { color: chartColors.value.tick },
    },
    y: {
      title: { display: true, text: 'Avg Time (s)', color: chartColors.value.tick },
      grid: { color: chartColors.value.grid },
      ticks: {
        color: chartColors.value.tick,
        callback: (value: number) => formatTime(Math.round(value * 1000)),
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number } }) => {
          const ms = Math.round(ctx.parsed.y * 1000)
          return `Avg: ${formatTime(ms)}`
        },
      },
    },
  },
}))

// --- Calendar heatmap ---
interface CalendarDay {
  date: string
  count: number
  dayOfWeek: number
}

const calendarGrid = computed(() => {
  const entries = (calendarData.value ?? []) as { date: string; count: number }[]
  const countMap = new Map<string, number>()
  for (const d of entries) {
    countMap.set(d.date, d.count)
  }

  const today = new Date()
  const days: CalendarDay[] = []

  if (entries.length === 0) return days

  // Start from the earliest data point (beginning of that week)
  const dates = entries.map(d => d.date).sort()
  const earliest = new Date(dates[0])
  // Back up to Sunday of that week
  earliest.setDate(earliest.getDate() - earliest.getDay())

  const diffDays = Math.ceil((today.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24))

  for (let i = diffDays; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      count: countMap.get(dateStr) ?? 0,
      dayOfWeek: d.getDay(),
    })
  }

  return days
})

const calendarWeeks = computed(() => {
  const days = calendarGrid.value
  if (days.length === 0) return []
  const weeks: CalendarDay[][] = []
  let currentWeek: CalendarDay[] = []

  // Pad the first week with empty slots
  const firstDay = days[0]
  for (let i = 0; i < firstDay.dayOfWeek; i++) {
    currentWeek.push({ date: '', count: -1, dayOfWeek: i })
  }

  for (const day of days) {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(day)
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
})

const monthLabels = computed(() => {
  const labels: { label: string; col: number }[] = []
  const weeks = calendarWeeks.value
  let lastMonth = -1

  for (let i = 0; i < weeks.length; i++) {
    const realDay = weeks[i].find(d => d.date !== '')
    if (!realDay) continue
    const month = new Date(realDay.date).getMonth()
    if (month !== lastMonth) {
      lastMonth = month
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      labels.push({ label: monthNames[month], col: i })
    }
  }

  return labels
})

function heatmapColor(count: number): string {
  if (count <= 0) return 'bg-gray-100 dark:bg-gray-800'
  if (count <= 5) return 'bg-green-200 dark:bg-green-900'
  if (count <= 15) return 'bg-green-400 dark:bg-green-700'
  return 'bg-green-600 dark:bg-green-500'
}

const tooltipDay = ref<CalendarDay | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })

function showTooltip(day: CalendarDay, event: MouseEvent) {
  if (day.count < 0) return
  tooltipDay.value = day
  tooltipPos.value = { x: event.clientX, y: event.clientY }
}

function hideTooltip() {
  tooltipDay.value = null
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">Analytics</h2>
      <USelect
        v-model="sessionFilter"
        :items="[{ label: 'All Sessions', value: null }, ...(sessions || []).map((s: { id: number; displayName: string }) => ({ label: s.displayName, value: s.id }))]"
        placeholder="All Sessions"
        class="w-48"
      />
    </div>

    <!-- Section A: Solve Time Distribution -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6">
      <h3 class="text-sm font-semibold mb-4">Solve Time Distribution</h3>
      <div v-if="(distData ?? []).length === 0" class="text-gray-400 dark:text-gray-500 text-sm py-8 text-center">
        No solve data available.
      </div>
      <div v-else class="h-72">
        <Bar :key="colorMode.value" :data="distChartData" :options="distChartOptions" />
      </div>
    </div>

    <!-- Section B: Practice Calendar Heatmap -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6">
      <h3 class="text-sm font-semibold mb-4">Practice Calendar</h3>
      <div class="overflow-x-auto">
        <div class="relative">
        <!-- Month labels -->
        <div class="flex ml-8 mb-1 relative h-4">
          <div
            v-for="(m, i) in monthLabels"
            :key="i"
            class="text-xs text-gray-400 dark:text-gray-500 absolute"
            :style="{ left: `${m.col * 14}px` }"
          >
            {{ m.label }}
          </div>
        </div>
        <div class="relative">
          <div class="flex">
            <!-- Day of week labels -->
            <div class="flex flex-col gap-[2px] mr-1">
              <div
                v-for="(label, i) in dayLabels"
                :key="i"
                class="h-[12px] text-[10px] text-gray-400 dark:text-gray-500 leading-[12px] pr-1 text-right"
              >
                {{ i % 2 === 1 ? label : '' }}
              </div>
            </div>
            <!-- Weeks grid -->
            <div class="flex gap-[2px]">
              <div v-for="(week, wi) in calendarWeeks" :key="wi" class="flex flex-col gap-[2px]">
                <div
                  v-for="(day, di) in week"
                  :key="di"
                  class="w-[12px] h-[12px] rounded-sm"
                  :class="day.count >= 0 ? heatmapColor(day.count) : 'bg-transparent'"
                  @mouseenter="showTooltip(day, $event)"
                  @mouseleave="hideTooltip"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- Legend -->
        <div class="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500">
          <span>Less</span>
          <div class="w-[12px] h-[12px] rounded-sm" :class="heatmapColor(0)" />
          <div class="w-[12px] h-[12px] rounded-sm" :class="heatmapColor(1)" />
          <div class="w-[12px] h-[12px] rounded-sm" :class="heatmapColor(10)" />
          <div class="w-[12px] h-[12px] rounded-sm" :class="heatmapColor(20)" />
          <span>More</span>
        </div>
        </div>
      </div>
      <!-- Tooltip -->
      <Teleport to="body">
        <div
          v-if="tooltipDay"
          class="fixed z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded px-2 py-1 pointer-events-none"
          :style="{ left: `${tooltipPos.x + 10}px`, top: `${tooltipPos.y - 30}px` }"
        >
          {{ tooltipDay.date }}: {{ tooltipDay.count }} solve{{ tooltipDay.count !== 1 ? 's' : '' }}
        </div>
      </Teleport>
    </div>

    <!-- Section C: Time-of-Day Performance -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold">Time-of-Day Performance</h3>
        <span v-if="bestHour >= 0" class="text-xs text-gray-400 dark:text-gray-500">
          Best hour: <span class="text-yellow-500 font-semibold">{{ String(bestHour).padStart(2, '0') }}:00</span>
        </span>
      </div>
      <div v-if="(hourlyData ?? []).length === 0" class="text-gray-400 dark:text-gray-500 text-sm py-8 text-center">
        No solve data available.
      </div>
      <div v-else class="h-72">
        <Bar :key="colorMode.value" :data="hourlyChartData" :options="hourlyChartOptions" />
      </div>
    </div>
  </div>
</template>
