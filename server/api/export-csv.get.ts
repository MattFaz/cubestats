import { useDrizzle, schema } from '../database'
import { asc } from 'drizzle-orm'

function formatTime(timeMs: number, penalty: string): string {
  if (penalty === 'dnf') return 'DNF'
  const seconds = timeMs / 1000
  const display = penalty === 'plus2' ? seconds + 2 : seconds
  return display.toFixed(3) + (penalty === 'plus2' ? '+' : '')
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export default defineEventHandler(async (event) => {
  const db = useDrizzle()

  const allSessions = await db.select().from(schema.sessions)
  const allSolves = await db.select().from(schema.solves).orderBy(asc(schema.solves.solvedAt))

  const rows: string[] = []
  rows.push('Session,Time,Penalty,Scramble,Comment,Date,Puzzle Type')

  for (const solve of allSolves) {
    const session = allSessions.find(s => s.id === solve.sessionId)
    const sessionName = session?.displayName || 'Unknown'

    rows.push([
      escapeCsv(sessionName),
      formatTime(solve.timeMs, solve.penalty),
      solve.penalty,
      escapeCsv(solve.scramble),
      escapeCsv(solve.comment || ''),
      solve.solvedAt.toISOString(),
      solve.puzzleType,
    ].join(','))
  }

  const csv = rows.join('\n')

  setResponseHeader(event, 'Content-Type', 'text/csv')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="cst_export.csv"`)
  return csv
})
