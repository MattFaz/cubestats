<script setup lang="ts">
const lastResult = ref<{ solvesAdded: number; solvesSkipped: number; sessionsCreated: number } | null>(null)
const { data: importHistory, refresh: refreshHistory } = useFetch('/api/imports')

function onImported(result: any) {
  lastResult.value = result
  refreshHistory()
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function exportData() {
  const blob = await $fetch('/api/export', { responseType: 'blob' })
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  downloadBlob(blob, `cstimer_${ts}.txt`)
}

async function exportCsv() {
  const blob = await $fetch('/api/export-csv', { responseType: 'blob' })
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  downloadBlob(blob, `cst_export_${ts}.csv`)
}
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-6">Import / Export</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 class="text-sm font-semibold mb-3">Import from csTimer</h3>
        <ImportDropzone @imported="onImported" />
        <div v-if="lastResult" class="mt-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <h4 class="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">Import Complete</h4>
          <ul class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <li>Solves added: <span class="text-gray-900 dark:text-white font-mono">{{ lastResult.solvesAdded }}</span></li>
            <li>Duplicates skipped: <span class="text-gray-900 dark:text-white font-mono">{{ lastResult.solvesSkipped }}</span></li>
            <li>Sessions created: <span class="text-gray-900 dark:text-white font-mono">{{ lastResult.sessionsCreated }}</span></li>
          </ul>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-semibold mb-3">Export</h3>
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Download your data in csTimer format or as a CSV spreadsheet.</p>
          <div class="flex gap-3">
            <UButton @click="exportData" icon="i-lucide-download">Export as csTimer .txt</UButton>
            <UButton @click="exportCsv" icon="i-lucide-table" variant="outline">Export as .csv</UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8" v-if="importHistory?.length">
      <h3 class="text-sm font-semibold mb-3">Import History</h3>
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-xs uppercase text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-800">
              <th class="text-left px-4 py-2">File</th>
              <th class="text-left px-4 py-2">Added</th>
              <th class="text-left px-4 py-2">Skipped</th>
              <th class="text-left px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="imp in importHistory" :key="imp.id" class="border-b border-gray-200/50 dark:border-gray-800/50">
              <td class="px-4 py-2 text-gray-600 dark:text-gray-300">{{ imp.filename }}</td>
              <td class="px-4 py-2 font-mono">{{ imp.solvesAdded }}</td>
              <td class="px-4 py-2 font-mono text-gray-400 dark:text-gray-500">{{ imp.solvesSkipped }}</td>
              <td class="px-4 py-2 text-gray-400 dark:text-gray-500">{{ new Date(imp.importedAt).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
