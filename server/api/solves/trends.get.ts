import { useDrizzle, schema } from '../../database'
import { eq, and, asc } from 'drizzle-orm'
import { computeAoN } from '../../utils/stats'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDrizzle()

  const conditions = []
  if (query.session_id) conditions.push(eq(schema.solves.sessionId, Number(query.session_id)))
  if (query.puzzle_type) conditions.push(eq(schema.solves.puzzleType, String(query.puzzle_type)))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const solves = await db.select({
    timeMs: schema.solves.timeMs,
    penalty: schema.solves.penalty,
    solvedAt: schema.solves.solvedAt,
  })
    .from(schema.solves)
    .where(where)
    .orderBy(asc(schema.solves.solvedAt))

  const times = solves.map(s => {
    if (s.penalty === 'dnf') return -1
    if (s.penalty === 'plus2') return s.timeMs + 2000
    return s.timeMs
  })

  function computeSeries(window: 5 | 12): { solvedAt: string; average: number }[] {
    const results: { solvedAt: string; average: number }[] = []
    for (let i = window - 1; i < times.length; i++) {
      const slice = times.slice(i - window + 1, i + 1)
      const avg = computeAoN(slice, window)
      if (avg !== null && avg !== -1) {
        results.push({
          solvedAt: solves[i].solvedAt.toISOString(),
          average: avg,
        })
      }
    }
    return results
  }

  return {
    ao5: computeSeries(5),
    ao12: computeSeries(12),
  }
})
