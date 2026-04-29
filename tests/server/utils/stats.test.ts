import { describe, it, expect } from 'vitest'
import { computeAoN, computeStats } from '../../../server/utils/stats'

describe('computeAoN', () => {
  it('ao5: drops best and worst, averages remaining 3', () => {
    const times = [10000, 12000, 11000, 13000, 9000]
    const result = computeAoN(times, 5)
    expect(result).toBe(11000)
  })

  it('ao5 with one DNF: DNF is worst, drop it and best', () => {
    const times = [10000, -1, 11000, 13000, 9000]
    const result = computeAoN(times, 5)
    expect(result).toBe(Math.round((10000 + 11000 + 13000) / 3))
  })

  it('ao5 with two DNFs: result is DNF (-1)', () => {
    const times = [10000, -1, -1, 13000, 9000]
    const result = computeAoN(times, 5)
    expect(result).toBe(-1)
  })

  it('returns null if fewer solves than N', () => {
    const times = [10000, 12000, 11000]
    const result = computeAoN(times, 5)
    expect(result).toBeNull()
  })

  it('ao12: drops best and worst, averages remaining 10', () => {
    const times = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]
    const result = computeAoN(times, 12)
    expect(result).toBe(65)
  })
})

describe('computeStats', () => {
  it('computes personal best', () => {
    const times = [15000, 12000, 18000, 11000, 14000]
    const result = computeStats(times)
    expect(result.pb).toBe(11000)
  })

  it('handles all DNFs', () => {
    const times = [-1, -1, -1]
    const result = computeStats(times)
    expect(result.pb).toBe(-1)
    expect(result.currentAo5).toBeNull()
  })

  it('computes current ao5 from last 5 solves', () => {
    const times = [10000, 20000, 15000, 12000, 18000, 11000, 14000]
    const result = computeStats(times)
    // last 5: 15000, 12000, 18000, 11000, 14000
    // drop 11000 and 18000, avg 15000+12000+14000 = 13667
    expect(result.currentAo5).toBe(Math.round((15000 + 12000 + 14000) / 3))
  })

  it('computes best ao5', () => {
    const times = [10000, 20000, 15000, 12000, 18000, 11000, 14000]
    const result = computeStats(times)
    expect(result.bestAo5).toBeDefined()
    expect(typeof result.bestAo5).toBe('number')
  })

  it('returns total solve count', () => {
    const times = [10000, 20000, 15000]
    const result = computeStats(times)
    expect(result.totalSolves).toBe(3)
  })
})
