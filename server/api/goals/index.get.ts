import { useDrizzle, schema } from '../../database'

export default defineEventHandler(async () => {
  const db = useDrizzle()
  return await db.select().from(schema.goals)
})
