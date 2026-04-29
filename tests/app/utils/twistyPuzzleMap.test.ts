import { describe, it, expect } from 'vitest'
import { toTwistyPuzzle } from '../../../app/utils/twistyPuzzleMap'

describe('toTwistyPuzzle', () => {
  it('maps NxN cube codes', () => {
    expect(toTwistyPuzzle('222')).toBe('2x2x2')
    expect(toTwistyPuzzle('333')).toBe('3x3x3')
    expect(toTwistyPuzzle('444')).toBe('4x4x4')
    expect(toTwistyPuzzle('555')).toBe('5x5x5')
    expect(toTwistyPuzzle('666')).toBe('6x6x6')
    expect(toTwistyPuzzle('777')).toBe('7x7x7')
  })

  it('treats 333 variants as 3x3x3', () => {
    expect(toTwistyPuzzle('333oh')).toBe('3x3x3')
    expect(toTwistyPuzzle('333bld')).toBe('3x3x3')
  })

  it('maps non-cubic puzzles', () => {
    expect(toTwistyPuzzle('pyraminx')).toBe('pyraminx')
    expect(toTwistyPuzzle('megaminx')).toBe('megaminx')
    expect(toTwistyPuzzle('skewb')).toBe('skewb')
    expect(toTwistyPuzzle('sq1')).toBe('square1')
  })

  it('returns null for unknown codes', () => {
    expect(toTwistyPuzzle('clock')).toBeNull()
    expect(toTwistyPuzzle('')).toBeNull()
  })
})
