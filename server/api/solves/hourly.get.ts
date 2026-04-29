import { useDrizzle, schema } from '../../database'
import { eq, ne, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDrizzle()

  const conditions = [ne(schema.solves.penalty, 'dnf')]
  if (query.session_id) conditions.push(eq(schema.solves.sessionId, Number(query.session_id)))
  if (query.puzzle_type) conditions.push(eq(schema.solves.puzzleType, String(query.puzzle_type)))

  const where = and(...conditions)

  const hourExpr = sql`CAST(strftime('%H', "solves"."solved_at", 'unixepoch') AS INTEGER)`

  const rows = await db
    .select({
      hour: sql<number>`${hourExpr}`.as('hour'),
      avgMs: sql<number>`CAST(AVG("solves"."time_ms") AS INTEGER)`.as('avg_ms'),
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(schema.solves)
    .where(where)
    .groupBy(hourExpr)
    .orderBy(hourExpr)

  return rows.map((r) => ({
    hour: Number(r.hour),
    avgMs: Number(r.avgMs),
    count: Number(r.count),
  }))
})
