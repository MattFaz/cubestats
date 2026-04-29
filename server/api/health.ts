import pkg from '../../package.json'

export default defineEventHandler(() => {
  return { ok: true, version: pkg.version }
})
