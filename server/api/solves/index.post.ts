import { useDrizzle, schema } from '../../database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { sessionId, timeMs, penalty, scramble, solvedAt, puzzleType } = body

  if (!sessionId || timeMs == null || !scramble || !solvedAt) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields: sessionId, timeMs, scramble, solvedAt' })
  }

  const db = useDrizzle()

  const [solve] = await db.insert(schema.solves).values({
    sessionId: Number(sessionId),
    timeMs: Number(timeMs),
    penalty: penalty || 'none',
    scramble: String(scramble),
    solvedAt: new Date(solvedAt),
    puzzleType: puzzleType ? String(puzzleType) : '333',
  }).returning()

  return solve
})
