import { PUZZLE_TYPES } from '~/utils/puzzleTypes'

export function usePuzzleFilter() {
  const currentPuzzle = useState('puzzleFilter', () => '333')
  return { currentPuzzle, PUZZLE_TYPES }
}
