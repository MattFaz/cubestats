import { useDrizzle, schema } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid session ID' })

  const body = await readBody(event)
  if (!body.displayName) throw createError({ statusCode: 400, statusMessage: 'displayName required' })

  const db = useDrizzle()
  const [updated] = await db.update(schema.sessions)
    .set({ displayName: body.displayName })
    .where(eq(schema.sessions.id, id))
    .returning()

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  return updated
})
