export interface ParsedSolve {
  timeMs: number
  penalty: 'none' | 'plus2' | 'dnf'
  scramble: string
  comment: string
  solvedAt: Date
  moveHistory: string | null
  puzzleType: string
}

export interface ParsedSession {
  sessionKey: string
  displayName: string
  puzzleType: string
  solves: ParsedSolve[]
}

export interface ParsedExport {
  sessions: ParsedSession[]
  rawJson: string
}

function parsePenalty(flag: number): 'none' | 'plus2' | 'dnf' {
  if (flag === -1) return 'dnf'
  if (flag === 2) return 'plus2'
  return 'none'
}

function penaltyToFlag(penalty: string): number {
  if (penalty === 'dnf') return -1
  if (penalty === 'plus2') return 2
  return 0
}

export function parseCstimerExport(raw: string): ParsedExport {
  const data = JSON.parse(raw)
  const sessionDataStr = data.properties?.sessionData
  const sessionData = sessionDataStr ? JSON.parse(sessionDataStr) : {}

  const sessions: ParsedSession[] = []

  for (let i = 1; i <= 15; i++) {
    const key = `session${i}`
    const solvesRaw: any[] = data[key] || []
    const meta = sessionData[String(i)] || {}

    const displayName = typeof meta.name === 'string' ? meta.name : `Session ${i}`

    const solves: ParsedSolve[] = solvesRaw.map((s: any) => {
      const [penaltyAndTime, scramble, comment, timestamp, extra] = s
      const [penaltyFlag, timeMs] = penaltyAndTime
      const moveHistory = extra?.[0] || null
      const puzzleType = extra?.[1] || '333'

      return {
        timeMs,
        penalty: parsePenalty(penaltyFlag),
        scramble,
        comment: comment || '',
        solvedAt: new Date(timestamp * 1000),
        moveHistory,
        puzzleType,
      }
    })

    const puzzleType = solves.length > 0 ? solves[0].puzzleType : '333'

    sessions.push({ sessionKey: key, displayName, puzzleType, solves })
  }

  return { sessions, rawJson: raw }
}

export interface ExportSolve {
  timeMs: number
  penalty: string
  scramble: string
  comment: string | null
  solvedAt: Date
  moveHistory: string | null
  puzzleType: string
}

export interface ExportSession {
  sessionKey: string
  displayName: string
  puzzleType: string
  solves: ExportSolve[]
}

export function reconstructCstimerExport(sessions: ExportSession[]): string {
  const data: Record<string, any> = {}
  const sessionData: Record<string, any> = {}

  for (let i = 1; i <= 15; i++) {
    const key = `session${i}`
    const session = sessions.find(s => s.sessionKey === key)

    if (session && session.solves.length > 0) {
      data[key] = session.solves.map(s => {
        const tuple: any[] = [
          [penaltyToFlag(s.penalty), s.timeMs],
          s.scramble,
          s.comment || '',
          Math.floor(s.solvedAt.getTime() / 1000),
        ]
        if (s.moveHistory) {
          tuple.push([s.moveHistory, s.puzzleType])
        }
        return tuple
      })
    } else {
      data[key] = []
    }

    const name = session?.displayName.startsWith('Session ')
      ? parseInt(session.displayName.replace('Session ', ''), 10) || session.displayName
      : session?.displayName || i

    sessionData[String(i)] = { name, opt: {}, rank: i }

    if (session && session.solves.length > 0) {
      const times = session.solves.filter(s => s.penalty !== 'dnf').map(s => s.timeMs)
      const dnfCount = session.solves.filter(s => s.penalty === 'dnf').length
      const bestTime = times.length > 0 ? Math.min(...times) : 0
      const timestamps = session.solves.map(s => Math.floor(s.solvedAt.getTime() / 1000))

      sessionData[String(i)].stat = [session.solves.length, dnfCount, bestTime]
      sessionData[String(i)].date = [Math.min(...timestamps), Math.max(...timestamps)]
    }
  }

  data.properties = { sessionData: JSON.stringify(sessionData) }
  return JSON.stringify(data)
}
