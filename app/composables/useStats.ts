export function useStats(sessionId?: Ref<number | null>, puzzleType?: Ref<string>) {
  const query = computed(() => {
    const params: Record<string, string> = {}
    if (sessionId?.value) params.session_id = String(sessionId.value)
    if (puzzleType?.value) params.puzzle_type = puzzleType.value
    return params
  })

  return useFetch('/api/solves/stats', { query, watch: [query] })
}
