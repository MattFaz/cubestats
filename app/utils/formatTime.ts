export function formatTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—'
  if (ms === -1) return 'DNF'
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toFixed(2)
  return minutes > 0 ? `${minutes}:${seconds.padStart(5, '0')}` : seconds
}
