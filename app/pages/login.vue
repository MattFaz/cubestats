<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const auth = useAuthStore()
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(password.value)
    navigateTo('/')
  } catch (e: any) {
    error.value = 'Invalid password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <div class="w-full max-w-xs space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-primary">CubeStats</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to continue</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <UFormField label="Password">
          <UInput v-model="password" type="password" placeholder="Password" autofocus class="w-full" />
        </UFormField>
        <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        <UButton type="submit" block :loading="loading">Sign In</UButton>
      </form>
    </div>
  </div>
</template>
