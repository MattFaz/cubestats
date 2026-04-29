<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const { currentPuzzle, PUZZLE_TYPES } = usePuzzleFilter()

const links = [
  { label: 'Dashboard', to: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Timer', to: '/timer', icon: 'i-lucide-timer' },
  { label: 'Sessions', to: '/sessions', icon: 'i-lucide-layers' },
  { label: 'History', to: '/history', icon: 'i-lucide-clock' },
  { label: 'Trends', to: '/trends', icon: 'i-lucide-trending-up' },
  { label: 'Analytics', to: '/analytics', icon: 'i-lucide-bar-chart-3' },
  { label: 'Import / Export', to: '/import', icon: 'i-lucide-upload' },
]

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <aside class="w-56 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0">
    <div class="p-4 border-b border-gray-200 dark:border-gray-800">
      <h1 class="text-lg font-bold text-primary mb-3">CubeStats</h1>
      <USelect
        v-model="currentPuzzle"
        :items="[...PUZZLE_TYPES]"
        value-key="value"
        label-key="label"
        class="w-full"
      />
    </div>
    <nav class="flex-1 p-2 space-y-1">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
        :class="isActive(link.to) ? 'bg-primary text-gray-950 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'"
      >
        <span :class="link.icon" class="w-5 h-5" />
        {{ link.label }}
      </NuxtLink>
    </nav>
    <div class="p-2 border-t border-gray-200 dark:border-gray-800">
      <ColorModeToggle />
      <NuxtLink
        to="/settings"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span class="i-lucide-settings w-5 h-5" />
        Settings
      </NuxtLink>
      <button
        @click="auth.logout()"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
      >
        <span class="i-lucide-log-out w-5 h-5" />
        Logout
      </button>
    </div>
  </aside>
</template>
