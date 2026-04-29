export function useChartTheme() {
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === 'dark')

  const chartColors = computed(() => ({
    point: isDark.value
      ? 'rgba(34, 197, 94, 0.6)'
      : 'rgba(22, 163, 74, 0.7)',
    grid: isDark.value
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.06)',
    tick: isDark.value
      ? 'rgba(255, 255, 255, 0.4)'
      : 'rgba(0, 0, 0, 0.4)',
  }))

  return { chartColors, isDark }
}
