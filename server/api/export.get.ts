import { reconstructCstimerExport, type ExportSession } from '../utils/cstimer'
import { useDrizzle, schema } from '../database'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDrizzle()

  const allSessions = await db.select().from(schema.sessions)
  const allSolves = await db.select().from(schema.solves).orderBy(asc(schema.solves.solvedAt))

  const exportSessions: ExportSession[] = []

  for (let i = 1; i <= 15; i++) {
    const key = `session${i}`
    const session = allSessions.find(s => s.sessionKey === key)

    const solves = session
      ? allSolves
          .filter(s => s.sessionId === session.id)
          .map(s => ({
            timeMs: s.timeMs,
            penalty: s.penalty,
            scramble: s.scramble,
            comment: s.comment,
            solvedAt: s.solvedAt,
            moveHistory: s.moveHistory,
            puzzleType: s.puzzleType,
          }))
      : []

    exportSessions.push({
      sessionKey: key,
      displayName: session?.displayName || `Session ${i}`,
      puzzleType: session?.puzzleType || '333',
      solves,
    })
  }

  const json = reconstructCstimerExport(exportSessions)

  setResponseHeader(event, 'Content-Type', 'application/octet-stream')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="cstimer_export.txt"`)
  return json
})
