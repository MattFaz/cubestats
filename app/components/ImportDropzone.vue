<script setup lang="ts">
const emit = defineEmits<{ imported: [result: { solvesAdded: number; solvesSkipped: number; sessionsCreated: number }] }>()

const dragging = ref(false)
const loading = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement>()

async function handleFile(file: File) {
  loading.value = true
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('file', file)
    const result = await $fetch('/api/import', { method: 'POST', body: formData })
    emit('imported', result)
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Import failed'
  } finally {
    loading.value = false
  }
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}
</script>

<template>
  <div @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop"
    class="border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer"
    :class="dragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'"
    @click="fileInput?.click()">
    <input ref="fileInput" type="file" accept=".txt" class="hidden" @change="onFileSelect" />
    <span class="i-lucide-upload text-3xl text-gray-400 dark:text-gray-500 mb-3 block mx-auto" />
    <p class="text-gray-500 dark:text-gray-400">
      <span v-if="loading">Importing...</span>
      <span v-else>Drop your cstimer export here or click to browse</span>
    </p>
    <p class="text-xs text-gray-500 dark:text-gray-600 mt-1">Accepts .txt files exported from cstimer.net</p>
    <p v-if="error" class="text-sm text-red-600 dark:text-red-400 mt-2">{{ error }}</p>
  </div>
</template>
