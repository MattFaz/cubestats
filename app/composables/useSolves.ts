export function useSolves(options: {
  sessionId?: Ref<number | null>
  puzzleType?: Ref<string>
  page?: Ref<number>
  limit?: Ref<number>
  sort?: Ref<string>
  dir?: Ref<string>
}) {
  const query = computed(() => {
    const params: Record<string, string> = {}
    if (options.sessionId?.value) params.session_id = String(options.sessionId.value)
    if (options.puzzleType?.value) params.puzzle_type = options.puzzleType.value
    if (options.page?.value) params.page = String(options.page.value)
    if (options.limit?.value) params.limit = String(options.limit.value)
    if (options.sort?.value) params.sort = options.sort.value
    if (options.dir?.value) params.dir = options.dir.value
    return params
  })

  return useFetch('/api/solves', { query, watch: [query] })
}
