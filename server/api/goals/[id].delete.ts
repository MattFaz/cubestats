import { useDrizzle, schema } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid goal ID' })
  }

  const db = useDrizzle()
  await db.delete(schema.goals).where(eq(schema.goals.id, id))

  return { success: true }
})
