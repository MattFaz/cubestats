import { eq } from 'drizzle-orm'
import { useDrizzle, schema } from '../../database'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid solve id' })
  }

  const db = useDrizzle()
  const deleted = await db
    .delete(schema.solves)
    .where(eq(schema.solves.id, id))
    .returning({ id: schema.solves.id })

  if (deleted.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Solve not found' })
  }

  return { ok: true, id: deleted[0].id }
})
