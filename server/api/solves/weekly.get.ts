import { useDrizzle, schema } from '../../database'
import { and, gte, lt, asc, eq } from 'drizzle-orm'
import { computeAoN } from '../../utils/stats'

function getWeekBounds(weeksAgo: number): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day

  const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)
  const start = new Date(thisMonday)
  start.setDate(start.getDate() - weeksAgo * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return { start, end }
}

function computeWeekStats(times: number[]) {
  const nonDnf = times.filter(t => t !== -1)
  const avgMs = nonDnf.length > 0 ? Math.round(nonDnf.reduce((a, b) => a + b, 0) / nonDnf.length) : null
  const bestSingle = nonDnf.length > 0 ? Math.min(...nonDnf) : null
  const bestAo5 = times.length >= 5 ? computeBestAo5(times) : null

  return {
    avgMs,
    totalSolves: times.length,
    bestSingle,
    bestAo5,
  }
}

function computeBestAo5(times: number[]): number | null {
  let best: number | null = null
  for (let i = 0; i <= times.length - 5; i++) {
    const slice = times.slice(i, i + 5)
    const avg = computeAoN(slice, 5)
    if (avg !== null && avg !== -1) {
      if (best === null || avg < best) best = avg
    }
  }
  return best
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDrizzle()

  const thisWeekBounds = getWeekBounds(0)
  const lastWeekBounds = getWeekBounds(1)

  const puzzleConditions = query.puzzle_type
    ? [eq(schema.solves.puzzleType, String(query.puzzle_type))]
    : []

  const [thisWeekSolves, lastWeekSolves] = await Promise.all([
    db.select({ timeMs: schema.solves.timeMs, penalty: schema.solves.penalty })
      .from(schema.solves)
      .where(and(
        gte(schema.solves.solvedAt, thisWeekBounds.start),
        lt(schema.solves.solvedAt, thisWeekBounds.end),
        ...puzzleConditions,
      ))
      .orderBy(asc(schema.solves.solvedAt)),
    db.select({ timeMs: schema.solves.timeMs, penalty: schema.solves.penalty })
      .from(schema.solves)
      .where(and(
        gte(schema.solves.solvedAt, lastWeekBounds.start),
        lt(schema.solves.solvedAt, lastWeekBounds.end),
        ...puzzleConditions,
      ))
      .orderBy(asc(schema.solves.solvedAt)),
  ])

  const toTimes = (solves: { timeMs: number; penalty: string }[]) =>
    solves.map(s => {
      if (s.penalty === 'dnf') return -1
      if (s.penalty === 'plus2') return s.timeMs + 2000
      return s.timeMs
    })

  return {
    thisWeek: computeWeekStats(toTimes(thisWeekSolves)),
    lastWeek: computeWeekStats(toTimes(lastWeekSolves)),
  }
})
