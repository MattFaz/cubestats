import { H3Event, getCookie, setCookie, deleteCookie } from 'h3'
import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE_NAME = 'cubestats_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function sign(value: string, secret: string): string {
  const signature = createHmac('sha256', secret).update(value).digest('base64url')
  return `${value}.${signature}`
}

function verify(signed: string, secret: string): string | null {
  const lastDot = signed.lastIndexOf('.')
  if (lastDot === -1) return null
  const value = signed.slice(0, lastDot)
  const expected = sign(value, secret)
  try {
    const a = Buffer.from(signed)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return null
    if (timingSafeEqual(a, b)) return value
  } catch {
    return null
  }
  return null
}

export function setAuthSession(event: H3Event) {
  const config = useRuntimeConfig()
  const token = sign('authenticated', config.authSecret)
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export function clearAuthSession(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function isAuthenticated(event: H3Event): boolean {
  const config = useRuntimeConfig()
  const cookie = getCookie(event, COOKIE_NAME)
  if (!cookie) return false
  return verify(cookie, config.authSecret) === 'authenticated'
}
