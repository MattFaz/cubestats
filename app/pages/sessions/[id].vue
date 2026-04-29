<script setup lang="ts">
const route = useRoute()
const sessionId = computed(() => Number(route.params.id))
const { data: session, refresh } = useFetch(() => `/api/sessions/${sessionId.value}`)
const { currentPuzzle, PUZZLE_TYPES } = usePuzzleFilter()
const { data: stats } = useStats(sessionId, currentPuzzle)

function puzzleLabel(value: string): string {
  return PUZZLE_TYPES.find(p => p.value === value)?.label ?? value
}
const viewMode = ref<'cards' | 'compact'>('cards')
const editing = ref(false)
const editName = ref('')

async function startRename() {
  editName.value = session.value?.displayName || ''
  editing.value = true
}

async function saveRename() {
  await $fetch(`/api/sessions/${sessionId.value}`, { method: 'PUT', body: { displayName: editName.value } })
  editing.value = false
  refresh()
}
</script>

<template>
  <div v-if="session">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/sessions" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
        <span class="i-lucide-arrow-left w-5 h-5" />
      </NuxtLink>
      <div v-if="!editing">
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-bold">{{ session.displayName }}</h2>
          <span class="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">{{ puzzleLabel(session.puzzleType) }}</span>
        </div>
        <button @click="startRename" class="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">Rename</button>
      </div>
      <div v-else class="flex items-center gap-2">
        <UInput v-model="editName" autofocus @keyup.enter="saveRename" />
        <UButton size="sm" @click="saveRename">Save</UButton>
        <UButton size="sm" variant="ghost" @click="editing = false">Cancel</UButton>
      </div>
      <div class="ml-auto"><ViewToggle v-model="viewMode" /></div>
    </div>

    <div v-if="viewMode === 'cards'" class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard label="Personal Best" :value="stats?.pb" />
      <StatCard label="Current Ao5" :value="stats?.currentAo5" />
      <StatCard label="Current Ao12" :value="stats?.currentAo12" />
      <StatCard label="Current Ao100" :value="stats?.currentAo100" />
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

    <SolveChart :solves="session.solves || []" class="mb-6" />
    <SolveTable :solves="session.solves || []" :compact="viewMode === 'compact'" />
  </div>
</template>
