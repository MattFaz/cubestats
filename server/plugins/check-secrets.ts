const INSECURE_PASSWORDS = new Set(['changeme', 'admin', 'password'])
const INSECURE_SECRET_PREFIXES = ['dev-secret', 'change-this', 'changeme']

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== 'production') return

  const config = useRuntimeConfig()
  const problems: string[] = []

  if (!config.authSecret || INSECURE_SECRET_PREFIXES.some((p) => config.authSecret.startsWith(p))) {
    problems.push('NUXT_AUTH_SECRET is unset or still using a placeholder value')
  }
  if (!config.authPass || INSECURE_PASSWORDS.has(config.authPass.toLowerCase())) {
    problems.push('NUXT_AUTH_PASS is unset or using a default/insecure value')
  }
  if (!config.databasePath) {
    problems.push('NUXT_DATABASE_PATH is unset')
  }

  if (problems.length > 0) {
    const msg = [
      'Refusing to start in production with insecure configuration:',
      ...problems.map((p) => `  - ${p}`),
      'Set the required environment variables before starting the server.',
    ].join('\n')
    throw new Error(msg)
  }
})
