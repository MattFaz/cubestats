<script setup lang="ts">
const page = ref(1)
const sort = ref('date')
const dir = ref('desc')
const sessionFilter = ref<number | null>(null)
const { currentPuzzle } = usePuzzleFilter()

const { data: sessions } = useFetch('/api/sessions')
const { data, refresh } = useSolves({ sessionId: sessionFilter, puzzleType: currentPuzzle, page, limit: ref(50), sort, dir })

const solves = computed(() => data.value?.solves || [])
const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / 50))

const toast = useToast()

async function handleDelete(id: number) {
  try {
    await $fetch(`/api/solves/${id}`, { method: 'DELETE' })
    await refresh()
    toast.add({ title: 'Solve deleted', color: 'success' })
  } catch (err: any) {
    toast.add({ title: 'Failed to delete solve', description: err?.statusMessage, color: 'error' })
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">History</h2>
      <div class="flex items-center gap-3">
        <USelect v-model="sessionFilter"
          :items="[{ label: 'All Sessions', value: null }, ...(sessions || []).map((s: any) => ({ label: s.displayName, value: s.id }))]"
          placeholder="All Sessions" class="w-44" />
      </div>
    </div>

    <SolveTable :solves="solves" compact editable @delete="handleDelete" />

    <div class="flex items-center justify-between mt-4">
      <p class="text-sm text-gray-400 dark:text-gray-500">{{ total }} solves total</p>
      <div class="flex gap-2">
        <UButton size="sm" variant="ghost" :disabled="page <= 1" @click="page--">Previous</UButton>
        <span class="text-sm text-gray-500 dark:text-gray-400 py-1">{{ page }} / {{ totalPages || 1 }}</span>
        <UButton size="sm" variant="ghost" :disabled="page >= totalPages" @click="page++">Next</UButton>
      </div>
    </div>
  </div>
</template>
