import { useDrizzle, schema } from '../../database'
import { eq, and, gte, lte, asc, desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 50, 200)
  const offset = (page - 1) * limit
  const sortBy = query.sort === 'time' ? schema.solves.timeMs : schema.solves.solvedAt
  const sortDir = query.dir === 'asc' ? asc : desc

  const db = useDrizzle()

  const conditions = []
  if (query.session_id) conditions.push(eq(schema.solves.sessionId, Number(query.session_id)))
  if (query.puzzle_type) conditions.push(eq(schema.solves.puzzleType, String(query.puzzle_type)))
  if (query.from) conditions.push(gte(schema.solves.solvedAt, new Date(String(query.from))))
  if (query.to) conditions.push(lte(schema.solves.solvedAt, new Date(String(query.to))))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const solves = await db.select().from(schema.solves)
    .where(where)
    .orderBy(sortDir(sortBy))
    .limit(limit)
    .offset(offset)

  const [{ count: total }] = await db.select({ count: sql<number>`count(*)` })
    .from(schema.solves)
    .where(where)

  return { solves, total, page, limit }
})
