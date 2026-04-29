import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
  }),
  actions: {
    async login(password: string) {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { password },
      })
      this.isLoggedIn = true
      return res
    },
    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.isLoggedIn = false
      navigateTo('/login')
    },
    async checkAuth() {
      try {
        await $fetch('/api/sessions')
        this.isLoggedIn = true
      } catch {
        this.isLoggedIn = false
      }
    },
  },
})
