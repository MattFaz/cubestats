import { setAuthSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (typeof body?.password !== 'string' || body.password !== config.authPass) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  setAuthSession(event)
  return { ok: true }
})
