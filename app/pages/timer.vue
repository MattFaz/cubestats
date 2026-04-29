<script setup lang="ts">
definePageMeta({ layout: 'default' })

type TimerState = 'idle' | 'ready' | 'inspection' | 'inspect-ready' | 'solving' | 'stopped'

const state = ref<TimerState>('idle')
const displayTime = ref('0.00')
const inspectionDisplay = ref('')
const inspectionColor = ref('text-green-500')
const scramble = ref('')
const scrambleLoading = ref(true)
const penalty = ref<'none' | '+2' | 'dnf'>('none')
const finalTimeMs = ref(0)

interface Session {
  id: number
  displayName: string
}

const { currentPuzzle, PUZZLE_TYPES } = usePuzzleFilter()

let scrambleGenId = 0

async function loadScramble() {
  const genId = ++scrambleGenId
  scrambleLoading.value = true
  try {
    const result = await generateScramble(currentPuzzle.value)
    if (genId !== scrambleGenId) return // stale result from rapid puzzle switch
    scramble.value = result
  } catch (e) {
    if (genId !== scrambleGenId) return
    console.error('Failed to generate scramble:', e)
    scramble.value = 'Scramble generation failed'
  } finally {
    if (genId === scrambleGenId) {
      scrambleLoading.value = false
    }
  }
}

// Session selector
const { data: sessions } = await useFetch('/api/sessions?all=true')
const allSessions = computed(() => {
  return (sessions.value as Session[] || []).map((s: Session) => ({
    label: s.displayName,
    value: s.id,
  }))
})
const selectedSessionId = ref<number | null>(
  (sessions.value as Session[] | null)?.[0]?.id ?? null,
)

watch(sessions, (val) => {
  if (val && val.length > 0 && !selectedSessionId.value) {
    selectedSessionId.value = val[0].id
  }
})

// Timing internals
let solveStartTime = 0
let inspectionStartTime = 0
let animFrameId = 0
let inspectionIntervalId: ReturnType<typeof setInterval> | undefined

const saving = ref(false)
const saved = ref(false)

function formatTimerDisplay(ms: number): string {
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toFixed(2)
  return minutes > 0 ? `${minutes}:${seconds.padStart(5, '0')}` : seconds
}

function startInspection() {
  state.value = 'inspection'
  inspectionStartTime = performance.now()
  penalty.value = 'none'

  const tick = () => {
    const elapsed = (performance.now() - inspectionStartTime) / 1000
    const remaining = 15 - elapsed

    if (remaining > 8) {
      inspectionColor.value = 'text-green-500'
      inspectionDisplay.value = String(Math.ceil(remaining))
    } else if (remaining > 3) {
      inspectionColor.value = 'text-yellow-500'
      inspectionDisplay.value = String(Math.ceil(remaining))
    } else if (remaining > 0) {
      inspectionColor.value = 'text-red-500'
      inspectionDisplay.value = String(Math.ceil(remaining))
    } else if (remaining > -2) {
      inspectionColor.value = 'text-red-500 animate-pulse'
      inspectionDisplay.value = '+2'
      penalty.value = '+2'
    } else {
      inspectionColor.value = 'text-red-500 animate-pulse'
      inspectionDisplay.value = 'DNF'
      penalty.value = 'dnf'
    }
  }

  tick()
  inspectionIntervalId = setInterval(tick, 100)
}

function stopInspection() {
  if (inspectionIntervalId) {
    clearInterval(inspectionIntervalId)
    inspectionIntervalId = undefined
  }
}

function startSolve() {
  stopInspection()
  state.value = 'solving'
  solveStartTime = performance.now()

  const updateDisplay = () => {
    if (state.value !== 'solving') return
    const elapsed = performance.now() - solveStartTime
    displayTime.value = formatTimerDisplay(elapsed)
    animFrameId = requestAnimationFrame(updateDisplay)
  }
  animFrameId = requestAnimationFrame(updateDisplay)
}

function stopSolve() {
  const elapsed = performance.now() - solveStartTime
  cancelAnimationFrame(animFrameId)
  finalTimeMs.value = Math.round(elapsed)
  displayTime.value = formatTimerDisplay(finalTimeMs.value)
  state.value = 'stopped'
  saved.value = false
}

function resetTimer() {
  cancelAnimationFrame(animFrameId)
  stopInspection()
  state.value = 'idle'
  displayTime.value = '0.00'
  inspectionDisplay.value = ''
  penalty.value = 'none'
  finalTimeMs.value = 0
  loadScramble()
  saved.value = false
}

function setPenalty(p: '+2' | 'dnf') {
  if (penalty.value === p) {
    penalty.value = 'none'
  } else {
    penalty.value = p
  }
}

function effectiveTimeMs(): number {
  if (penalty.value === 'dnf') return -1
  if (penalty.value === '+2') return finalTimeMs.value + 2000
  return finalTimeMs.value
}

async function saveSolve() {
  if (!selectedSessionId.value || saving.value) return
  saving.value = true
  try {
    await $fetch('/api/solves', {
      method: 'POST',
      body: {
        sessionId: selectedSessionId.value,
        timeMs: effectiveTimeMs(),
        penalty: penalty.value,
        scramble: scramble.value,
        solvedAt: new Date().toISOString(),
        puzzleType: currentPuzzle.value,
      },
    })
    saved.value = true
    // Auto-advance to next solve after brief delay
    setTimeout(() => {
      resetTimer()
    }, 500)
  } catch (e: any) {
    console.error('Failed to save solve:', e)
  } finally {
    saving.value = false
  }
}

// Keyboard handling

function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return

  if (e.key === 'Escape') {
    resetTimer()
    return
  }

  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault()

    if (state.value === 'idle' && scrambleLoading.value) return
    if (state.value === 'idle' || state.value === 'stopped') {
      // If stopped, reset first then go to ready
      if (state.value === 'stopped') {
        resetTimer()
      }
      state.value = 'ready'
    } else if (state.value === 'inspection') {
      state.value = 'inspect-ready'
    }
  }

  // Any key stops the solve timer
  if (state.value === 'solving') {
    e.preventDefault()
    stopSolve()
  }
}

function handleKeyUp(e: KeyboardEvent) {
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault()

    if (state.value === 'ready') {
      startInspection()
    } else if (state.value === 'inspect-ready') {
      startSolve()
    }
  }
}

watch(currentPuzzle, () => {
  if (state.value === 'idle') {
    loadScramble()
  }
})

onMounted(() => {
  loadScramble()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  cancelAnimationFrame(animFrameId)
  stopInspection()
})
</script>

<template>
  <div class="flex-1 flex flex-col h-screen bg-white dark:bg-gray-900 select-none" tabindex="-1">
    <!-- Top bar with session selector -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Timer</h2>
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">{{ PUZZLE_TYPES.find(p => p.value === currentPuzzle)?.label ?? currentPuzzle }}</span>
        <label class="text-sm text-gray-500 dark:text-gray-400">Session:</label>
        <USelect
          v-if="allSessions.length > 0"
          v-model="selectedSessionId"
          :items="allSessions"
          value-key="value"
          class="w-48"
        />
        <span v-else class="text-sm text-gray-400 dark:text-gray-500">No sessions available</span>
      </div>
    </div>

    <!-- Scramble display -->
    <div class="px-6 py-3 text-center border-b border-gray-200 dark:border-gray-800">
      <p v-if="scrambleLoading" class="text-base font-mono text-gray-400 dark:text-gray-500 animate-pulse">Generating scramble...</p>
      <p v-else class="text-base font-mono text-gray-600 dark:text-gray-300 tracking-wide">{{ scramble }}</p>
    </div>

    <!-- 3D scramble preview -->
    <div
      v-show="state === 'idle' || state === 'stopped'"
      class="flex justify-center px-6 py-2 border-b border-gray-200 dark:border-gray-800"
    >
      <TwistyScramble
        v-if="!scrambleLoading && scramble"
        :puzzle-type="currentPuzzle"
        :scramble="scramble"
      />
      <div v-else style="width: 250px; height: 180px" />
    </div>

    <!-- Main timer area -->
    <div class="flex-1 flex flex-col items-center justify-center gap-6">
      <!-- Inspection countdown -->
      <div
        v-if="state === 'inspection' || state === 'inspect-ready'"
        class="text-8xl font-bold font-mono tabular-nums"
        :class="inspectionColor"
      >
        {{ inspectionDisplay }}
      </div>

      <!-- Main time display -->
      <div
        class="text-9xl font-bold font-mono tabular-nums transition-colors duration-150"
        :class="{
          'text-gray-900 dark:text-white': state === 'idle' || state === 'solving' || state === 'stopped',
          'text-green-500': state === 'ready' || state === 'inspect-ready',
          'text-gray-400 dark:text-gray-600': state === 'inspection',
        }"
      >
        {{ displayTime }}
      </div>

      <!-- Penalty indicator -->
      <div v-if="state === 'stopped' && penalty !== 'none'" class="text-2xl font-semibold text-red-500">
        {{ penalty === '+2' ? '+2 penalty' : 'DNF' }}
      </div>

      <!-- State prompts -->
      <p v-if="state === 'idle'" class="text-lg text-gray-400 dark:text-gray-500">
        Press and hold <kbd class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono text-sm">Space</kbd> to start
      </p>
      <p v-if="state === 'ready'" class="text-lg text-green-500">
        Release to begin inspection...
      </p>
      <p v-if="state === 'inspection'" class="text-lg text-gray-400 dark:text-gray-500">
        Hold <kbd class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono text-sm">Space</kbd> then release to start solving
      </p>
      <p v-if="state === 'inspect-ready'" class="text-lg text-green-500">
        Release to start solving...
      </p>
      <p v-if="state === 'solving'" class="text-lg text-gray-400 dark:text-gray-500">
        Press any key to stop
      </p>

      <!-- Stopped actions -->
      <div v-if="state === 'stopped'" class="flex items-center gap-3 mt-4">
        <UButton
          :disabled="!selectedSessionId || saving || saved"
          :loading="saving"
          color="primary"
          size="lg"
          @click="saveSolve"
        >
          {{ saved ? 'Saved!' : 'Save' }}
        </UButton>
        <UButton
          :variant="penalty === '+2' ? 'solid' : 'outline'"
          color="warning"
          size="lg"
          @click="setPenalty('+2')"
        >
          +2
        </UButton>
        <UButton
          :variant="penalty === 'dnf' ? 'solid' : 'outline'"
          color="error"
          size="lg"
          @click="setPenalty('dnf')"
        >
          DNF
        </UButton>
        <UButton
          variant="ghost"
          color="neutral"
          size="lg"
          @click="resetTimer"
        >
          Discard
        </UButton>
      </div>
    </div>

    <!-- Bottom hint -->
    <div class="px-6 py-3 text-center border-t border-gray-200 dark:border-gray-800">
      <p class="text-xs text-gray-400 dark:text-gray-600">
        <kbd class="font-mono">Esc</kbd> to cancel at any time
      </p>
    </div>
  </div>
</template>
