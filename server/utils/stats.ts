export function computeAoN(times: number[], n: number): number | null {
  if (times.length < n) return null

  const window = times.slice(-n)
  const dnfCount = window.filter(t => t === -1).length

  const maxDnf = n <= 12 ? 1 : Math.floor(n * 0.05)
  if (dnfCount > maxDnf) return -1

  const sorted = [...window].sort((a, b) => {
    if (a === -1 && b === -1) return 0
    if (a === -1) return 1
    if (b === -1) return -1
    return a - b
  })

  const dropCount = n <= 12 ? 1 : Math.floor(n * 0.05)
  const trimmed = sorted.slice(dropCount, sorted.length - dropCount)

  const sum = trimmed.reduce((acc, t) => acc + t, 0)
  return Math.round(sum / trimmed.length)
}

export function bestAoN(allTimes: number[], n: number): number | null {
  if (allTimes.length < n) return null

  let best: number | null = null
  for (let i = 0; i <= allTimes.length - n; i++) {
    const window = allTimes.slice(i, i + n)
    const ao = computeAoN(window, n)
    if (ao === null) continue
    if (ao === -1) continue
    if (best === null || ao < best) best = ao
  }
  return best
}

export interface Stats {
  pb: number | null
  totalSolves: number
  currentAo5: number | null
  currentAo12: number | null
  currentAo100: number | null
  bestAo5: number | null
  bestAo12: number | null
  bestAo100: number | null
}

export function computeStats(times: number[]): Stats {
  const nonDnf = times.filter(t => t !== -1)
  const pb = nonDnf.length > 0 ? Math.min(...nonDnf) : (times.length > 0 ? -1 : null)

  return {
    pb,
    totalSolves: times.length,
    currentAo5: computeAoN(times, 5),
    currentAo12: computeAoN(times, 12),
    currentAo100: computeAoN(times, 100),
    bestAo5: bestAoN(times, 5),
    bestAo12: bestAoN(times, 12),
    bestAo100: bestAoN(times, 100),
  }
}
