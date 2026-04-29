import { useDrizzle, schema } from '../../database'
import { eq, ne, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDrizzle()
  const bucketSize = Number(query.bucket_size) || 2000

  const conditions = [ne(schema.solves.penalty, 'dnf')]
  if (query.session_id) conditions.push(eq(schema.solves.sessionId, Number(query.session_id)))
  if (query.puzzle_type) conditions.push(eq(schema.solves.puzzleType, String(query.puzzle_type)))

  const where = and(...conditions)

  const safeBucket = Math.max(500, Math.min(60000, Math.round(bucketSize)))
  const bucketExpr = sql.raw(`FLOOR("solves"."time_ms" / ${safeBucket}) * ${safeBucket}`)

  const rows = await db
    .select({
      bucketStart: sql<number>`${bucketExpr}`.as('bucket_start'),
      count: sql<number>`COUNT(*)::int`.as('count'),
    })
    .from(schema.solves)
    .where(where)
    .groupBy(bucketExpr)
    .orderBy(bucketExpr)

  return rows.map((r) => ({
    bucketStart: Number(r.bucketStart),
    bucketEnd: Number(r.bucketStart) + bucketSize,
    count: Number(r.count),
  }))
})
