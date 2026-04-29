import { useDrizzle, schema } from '../../database'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid session ID' })

  const db = useDrizzle()
  const [session] = await db.select().from(schema.sessions).where(eq(schema.sessions.id, id)).limit(1)
  if (!session) throw createError({ statusCode: 404, statusMessage: 'Session not found' })

  const solves = await db.select().from(schema.solves)
    .where(eq(schema.solves.sessionId, id))
    .orderBy(asc(schema.solves.solvedAt))

  return { ...session, solves }
})
