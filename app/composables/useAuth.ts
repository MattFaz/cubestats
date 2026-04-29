import { useAuthStore } from '~/stores/auth'

export function useAuth() {
  const store = useAuthStore()

  const requireAuth = async () => {
    await store.checkAuth()
    if (!store.isLoggedIn) {
      navigateTo('/login')
    }
  }

  return { store, requireAuth }
}
