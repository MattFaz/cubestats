import { useDrizzle, schema } from '../../database'
import { sql, gte, eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDrizzle()

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const conditions = [gte(schema.solves.solvedAt, oneYearAgo)]
  if (query.puzzle_type) conditions.push(eq(schema.solves.puzzleType, String(query.puzzle_type)))

  const dateExpr = sql`strftime('%Y-%m-%d', "solves"."solved_at", 'unixepoch')`

  const rows = await db
    .select({
      date: sql<string>`${dateExpr}`.as('date'),
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(schema.solves)
    .where(and(...conditions))
    .groupBy(dateExpr)
    .orderBy(dateExpr)

  return rows.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }))
})
