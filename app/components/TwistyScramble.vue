<script setup lang="ts">
import { toTwistyPuzzle } from '~/utils/twistyPuzzleMap'

const props = defineProps<{
  puzzleType: string
  scramble: string
}>()

const twistyReady = ref(false)
const twistyFailed = ref(false)

const twistyPuzzle = computed(() => toTwistyPuzzle(props.puzzleType))
const visible = computed(
  () => twistyReady.value && !twistyFailed.value && twistyPuzzle.value !== null,
)

onMounted(async () => {
  try {
    await import('cubing/twisty')
    twistyReady.value = true
  } catch (e) {
    console.error('Failed to load cubing/twisty:', e)
    twistyFailed.value = true
  }
})
</script>

<template>
  <div class="flex justify-center items-center" style="height: 180px; width: 250px">
    <twisty-player
      v-if="visible"
      :puzzle="twistyPuzzle"
      :alg="scramble"
      control-panel="none"
      background="none"
      style="width: 250px; height: 180px"
    />
  </div>
</template>
