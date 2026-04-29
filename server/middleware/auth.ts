import { isAuthenticated } from '../utils/auth'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Skip auth for login endpoint and non-API routes
  if (path === '/api/auth/login' || !path.startsWith('/api/')) return

  if (!isAuthenticated(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
