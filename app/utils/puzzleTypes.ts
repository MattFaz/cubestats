export const PUZZLE_TYPES = [
  { value: '222', label: '2x2' },
  { value: '333', label: '3x3' },
  { value: '444', label: '4x4' },
  { value: '555', label: '5x5' },
  { value: '666', label: '6x6' },
  { value: '777', label: '7x7' },
  { value: '333oh', label: '3x3 OH' },
  { value: '333bld', label: '3x3 BLD' },
  { value: 'skewb', label: 'Skewb' },
  { value: 'pyra', label: 'Pyraminx' },
  { value: 'mega', label: 'Megaminx' },
  { value: 'sq1', label: 'Square-1' },
] as const

export type PuzzleType = typeof PUZZLE_TYPES[number]['value']
