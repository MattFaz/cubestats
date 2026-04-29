import { parseCstimerExport } from '../utils/cstimer'
import { useDrizzle, schema } from '../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const file = formData[0]
  const raw = file.data.toString('utf-8')
  const filename = file.filename || 'unknown.txt'

  let parsed
  try {
    parsed = parseCstimerExport(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid cstimer export format' })
  }

  const db = useDrizzle()
  let solvesAdded = 0
  let solvesSkipped = 0
  let sessionsCreated = 0

  const [importRecord] = await db.insert(schema.imports).values({
    filename,
    rawJson: raw,
    solvesAdded: 0,
    solvesSkipped: 0,
  }).returning()

  for (const session of parsed.sessions) {
    if (session.solves.length === 0) continue

    let [existing] = await db.select().from(schema.sessions)
      .where(eq(schema.sessions.sessionKey, session.sessionKey))
      .limit(1)

    if (!existing) {
      [existing] = await db.insert(schema.sessions).values({
        sessionKey: session.sessionKey,
        displayName: session.displayName,
        puzzleType: session.puzzleType,
      }).returning()
      sessionsCreated++
    }

    for (const solve of session.solves) {
      const inserted = await db.insert(schema.solves).values({
        sessionId: existing.id,
        importId: importRecord.id,
        timeMs: solve.timeMs,
        penalty: solve.penalty,
        scramble: solve.scramble,
        comment: solve.comment || null,
        solvedAt: solve.solvedAt,
        moveHistory: solve.moveHistory,
        puzzleType: solve.puzzleType,
      }).onConflictDoNothing().returning({ id: schema.solves.id })

      if (inserted.length > 0) {
        solvesAdded++
      } else {
        solvesSkipped++
      }
    }
  }

  await db.update(schema.imports)
    .set({ solvesAdded, solvesSkipped })
    .where(eq(schema.imports.id, importRecord.id))

  return { solvesAdded, solvesSkipped, sessionsCreated, importId: importRecord.id }
})
