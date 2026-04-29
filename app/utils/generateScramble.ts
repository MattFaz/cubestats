// Maps our puzzleType values to cubing.js event IDs
const PUZZLE_TO_EVENT: Record<string, string> = {
  '222': '222',
  '333': '333',
  '444': '444',
  '555': '555',
  '666': '666',
  '777': '777',
  '333oh': '333',     // OH uses same scrambles as 3x3
  '333bld': '333bf',
  'skewb': 'skewb',
  'pyra': 'pyram',
  'mega': 'minx',
  'sq1': 'sq1',
}

export async function generateScramble(puzzleType: string = '333'): Promise<string> {
  if (import.meta.server) return '' // Skip on SSR
  const { randomScrambleForEvent } = await import('cubing/scramble')
  const eventId = PUZZLE_TO_EVENT[puzzleType]
  if (!eventId) {
    console.warn(`Unknown puzzle type "${puzzleType}", falling back to 3x3`)
  }
  const alg = await randomScrambleForEvent(eventId || '333')
  return alg.toString()
}
