<script setup lang="ts">
const props = defineProps<{
  solves: any[]
  compact?: boolean
  editable?: boolean
}>()

const emit = defineEmits<{
  delete: [id: number]
}>()

function formatTime(ms: number, penalty: string): string {
  if (penalty === 'dnf') return 'DNF'
  const effective = penalty === 'plus2' ? ms + 2000 : ms
  const totalSeconds = effective / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toFixed(2)
  const time = minutes > 0 ? `${minutes}:${seconds.padStart(5, '0')}` : seconds
  return penalty === 'plus2' ? `${time}+` : time
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function onDelete(solve: any) {
  const label = formatTime(solve.timeMs, solve.penalty)
  if (window.confirm(`Delete this solve? (${label}, ${formatDate(solve.solvedAt)})`)) {
    emit('delete', solve.id)
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
    <table class="w-full" :class="compact ? 'text-xs' : 'text-sm'">
      <thead>
        <tr class="text-xs uppercase text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-800">
          <th class="text-left w-10" :class="compact ? 'px-2 py-1' : 'px-4 py-2'">#</th>
          <th class="text-left" :class="compact ? 'px-2 py-1' : 'px-4 py-2'">Time</th>
          <th class="text-left" :class="compact ? 'px-2 py-1' : 'px-4 py-2'">Scramble</th>
          <th class="text-left" :class="compact ? 'px-2 py-1 w-16' : 'px-4 py-2 w-24'">Date</th>
          <th v-if="editable" class="w-10" :class="compact ? 'px-2 py-1' : 'px-4 py-2'"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(solve, i) in solves"
          :key="solve.id"
          class="group border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
        >
          <td class="text-gray-400 dark:text-gray-500" :class="compact ? 'px-2 py-0.5' : 'px-4 py-2'">{{ i + 1 }}</td>
          <td class="font-mono font-semibold" :class="compact ? 'px-2 py-0.5' : 'px-4 py-2'">{{ formatTime(solve.timeMs, solve.penalty) }}</td>
          <td class="text-gray-500 dark:text-gray-400 truncate max-w-xs" :class="compact ? 'px-2 py-0.5' : 'px-4 py-2'">{{ solve.scramble }}</td>
          <td class="text-gray-400 dark:text-gray-500" :class="compact ? 'px-2 py-0.5' : 'px-4 py-2'">{{ formatDate(solve.solvedAt) }}</td>
          <td v-if="editable" class="text-right" :class="compact ? 'px-2 py-0.5' : 'px-4 py-2'">
            <UButton
              icon="i-lucide-trash-2"
              size="xs"
              color="error"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              :aria-label="`Delete solve ${i + 1}`"
              @click="onDelete(solve)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
