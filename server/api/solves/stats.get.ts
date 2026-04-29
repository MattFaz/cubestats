import { useDrizzle, schema } from '../../database'
import { eq, and, asc } from 'drizzle-orm'
import { computeStats } from '../../utils/stats'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDrizzle()

  const conditions = []
  if (query.session_id) conditions.push(eq(schema.solves.sessionId, Number(query.session_id)))
  if (query.puzzle_type) conditions.push(eq(schema.solves.puzzleType, String(query.puzzle_type)))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const solves = await db.select({ timeMs: schema.solves.timeMs, penalty: schema.solves.penalty })
    .from(schema.solves)
    .where(where)
    .orderBy(asc(schema.solves.solvedAt))

  const times = solves.map(s => {
    if (s.penalty === 'dnf') return -1
    if (s.penalty === 'plus2') return s.timeMs + 2000
    return s.timeMs
  })

  return computeStats(times)
})
