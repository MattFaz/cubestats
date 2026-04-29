import { useDrizzle, schema } from '../../database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.metric || !body.targetMs) {
    throw createError({ statusCode: 400, message: 'metric and targetMs are required' })
  }

  const validMetrics = ['pb', 'ao5', 'ao12', 'ao100']
  if (!validMetrics.includes(body.metric)) {
    throw createError({ statusCode: 400, message: `metric must be one of: ${validMetrics.join(', ')}` })
  }

  const db = useDrizzle()
  const [goal] = await db.insert(schema.goals).values({
    metric: body.metric,
    targetMs: Number(body.targetMs),
  }).onConflictDoUpdate({
    target: schema.goals.metric,
    set: { targetMs: Number(body.targetMs) },
  }).returning()

  return goal
})
