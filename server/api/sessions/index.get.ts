import { useDrizzle, schema } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const includeEmpty = query.all === 'true'

  const db = useDrizzle()
  const sessions = await (query.puzzle_type
    ? db.select().from(schema.sessions).where(eq(schema.sessions.puzzleType, String(query.puzzle_type)))
    : db.select().from(schema.sessions))

  const result = await Promise.all(sessions.map(async (session) => {
    const solves = await db.select().from(schema.solves)
      .where(eq(schema.solves.sessionId, session.id))

    const solveCount = solves.length
    const nonDnf = solves.filter(s => s.penalty !== 'dnf')
    const bestTime = nonDnf.length > 0 ? Math.min(...nonDnf.map(s => s.timeMs)) : null

    return { ...session, solveCount, bestTime }
  }))

  return includeEmpty ? result : result.filter(s => s.solveCount > 0)
})
