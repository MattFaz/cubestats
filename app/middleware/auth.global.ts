import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  const auth = useAuthStore()
  if (auth.isLoggedIn) return

  const fetcher = import.meta.server ? useRequestFetch() : $fetch
  try {
    await fetcher('/api/sessions')
    auth.isLoggedIn = true
  } catch {
    auth.isLoggedIn = false
  }

  if (!auth.isLoggedIn) {
    return navigateTo('/login')
  }
})
