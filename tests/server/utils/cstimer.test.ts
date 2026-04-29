import { describe, it, expect } from 'vitest'
import { parseCstimerExport, reconstructCstimerExport } from '../../../server/utils/cstimer'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const fixture = readFileSync(resolve(__dirname, '../../fixtures/cstimer_sample.json'), 'utf-8')

describe('parseCstimerExport', () => {
  it('parses the top-level session keys', () => {
    const result = parseCstimerExport(fixture)
    expect(result.sessions).toHaveLength(15)
    expect(result.sessions[0].sessionKey).toBe('session1')
  })

  it('extracts solves from session1', () => {
    const result = parseCstimerExport(fixture)
    const s1 = result.sessions.find(s => s.sessionKey === 'session1')!
    expect(s1.solves).toHaveLength(5)
  })

  it('parses solve time correctly', () => {
    const result = parseCstimerExport(fixture)
    const s1 = result.sessions.find(s => s.sessionKey === 'session1')!
    expect(s1.solves[0].timeMs).toBe(138805)
  })

  it('parses penalty flag 0 as none', () => {
    const result = parseCstimerExport(fixture)
    const s1 = result.sessions.find(s => s.sessionKey === 'session1')!
    expect(s1.solves[0].penalty).toBe('none')
  })

  it('extracts scramble', () => {
    const result = parseCstimerExport(fixture)
    const s1 = result.sessions.find(s => s.sessionKey === 'session1')!
    expect(s1.solves[0].scramble).toBe("R D R2 F2 L2 R2 B R2 B2 F' U2 F U L2 R U' F' D2 B2")
  })

  it('extracts puzzle type from solve tuple', () => {
    const result = parseCstimerExport(fixture)
    const s1 = result.sessions.find(s => s.sessionKey === 'session1')!
    expect(s1.solves[0].puzzleType).toBe('333')
  })

  it('extracts timestamp as Date', () => {
    const result = parseCstimerExport(fixture)
    const s1 = result.sessions.find(s => s.sessionKey === 'session1')!
    expect(s1.solves[0].solvedAt).toBeInstanceOf(Date)
    expect(s1.solves[0].solvedAt.getTime()).toBe(1775395559 * 1000)
  })

  it('extracts move history', () => {
    const result = parseCstimerExport(fixture)
    const s1 = result.sessions.find(s => s.sessionKey === 'session1')!
    expect(s1.solves[0].moveHistory).toContain("F'@0")
  })

  it('parses sessionData for display names', () => {
    const result = parseCstimerExport(fixture)
    const s1 = result.sessions.find(s => s.sessionKey === 'session1')!
    expect(s1.displayName).toBe('Session 1')
  })

  it('returns empty solves for empty sessions', () => {
    const result = parseCstimerExport(fixture)
    const s2 = result.sessions.find(s => s.sessionKey === 'session2')!
    expect(s2.solves).toHaveLength(0)
  })
})

describe('reconstructCstimerExport', () => {
  it('round-trips: parse then reconstruct preserves solve data', () => {
    const parsed = parseCstimerExport(fixture)
    const exported = reconstructCstimerExport(parsed.sessions)
    const reParsed = parseCstimerExport(exported)

    const s1Original = parsed.sessions.find(s => s.sessionKey === 'session1')!
    const s1Rebuilt = reParsed.sessions.find(s => s.sessionKey === 'session1')!

    expect(s1Rebuilt.solves).toHaveLength(s1Original.solves.length)
    for (let i = 0; i < s1Original.solves.length; i++) {
      expect(s1Rebuilt.solves[i].timeMs).toBe(s1Original.solves[i].timeMs)
      expect(s1Rebuilt.solves[i].penalty).toBe(s1Original.solves[i].penalty)
      expect(s1Rebuilt.solves[i].scramble).toBe(s1Original.solves[i].scramble)
      expect(s1Rebuilt.solves[i].solvedAt.getTime()).toBe(s1Original.solves[i].solvedAt.getTime())
      expect(s1Rebuilt.solves[i].puzzleType).toBe(s1Original.solves[i].puzzleType)
    }
  })

  it('preserves all 15 session keys in output', () => {
    const parsed = parseCstimerExport(fixture)
    const exported = reconstructCstimerExport(parsed.sessions)
    const json = JSON.parse(exported)
    for (let i = 1; i <= 15; i++) {
      expect(json[`session${i}`]).toBeDefined()
    }
  })

  it('empty sessions produce empty arrays', () => {
    const parsed = parseCstimerExport(fixture)
    const exported = reconstructCstimerExport(parsed.sessions)
    const json = JSON.parse(exported)
    expect(json.session2).toEqual([])
  })
})
