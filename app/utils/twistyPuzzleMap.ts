const PUZZLE_MAP: Record<string, string> = {
  '222': '2x2x2',
  '333': '3x3x3',
  '333oh': '3x3x3',
  '333bld': '3x3x3',
  '444': '4x4x4',
  '555': '5x5x5',
  '666': '6x6x6',
  '777': '7x7x7',
  pyraminx: 'pyraminx',
  megaminx: 'megaminx',
  skewb: 'skewb',
  sq1: 'square1',
}

export function toTwistyPuzzle(cubestatsCode: string): string | null {
  return PUZZLE_MAP[cubestatsCode] ?? null
}
