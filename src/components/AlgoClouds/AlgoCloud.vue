<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { TransformationMatrix } from '@/lib/geometry'

interface Props {
  index: number
  cx: number
  cy: number
  width: number
  height: number
  points: number
}

const props = defineProps<Props>()

const transformString = computed(() => {
  const tm = new TransformationMatrix()
  tm.translate(props.cx - props.width / 2, props.cy - props.height / 2)
  return tm.getMatrixString()
})

const GAP = props.width / props.points
const randomiseGap = (gap: number) => gap + (Math.random() - 0.5) * 0.5 * gap

const circles = ref<{ cx: number; cy: number; r: number }[]>([])

const generateCloud = () => {
  const midX = props.width / 2
  const midY = props.height / 2
  circles.value = [...Array(props.points + 1).keys()].map((i) => {
    const cx = midX - props.width / 2 + randomiseGap(GAP) * i
    const cy = midY + (Math.random() - 0.6) * props.height * 0.75
    const r = (Math.random() - 0.5) * 25 + 100
    return { cx, cy, r }
  })
}

const transitionDuration = ref(0)
const transitionCloud = async () => {
  const nextDuration = 2000 + (Math.random() - 0.5) * 500
  transitionDuration.value = nextDuration / 1000
  await new Promise((resolve) => setTimeout(resolve, 0))
  generateCloud()
  setTimeout(transitionCloud, nextDuration)
}

//let timeout: ReturnType<typeof setTimeout>
onMounted(() => {
  generateCloud()
  transitionCloud()
})
</script>

<template>
  <g :style="`--transition-duration: ${transitionDuration}s`" :transform="transformString">
    <mask :id="`cloudMask${index}`">
      <rect
        class="mask"
        :x="-200"
        :y="-200"
        :width="props.width + 400"
        :height="props.height + 400"
      />
      <g transform="translate(0,-50)">
        <circle
          v-for="({ cx, cy, r }, i) in circles"
          :key="i"
          fill="black"
          :cx="cx"
          :cy="cy"
          :r="r"
        />
      </g>
    </mask>

    <circle v-for="({ cx, cy, r }, i) in circles" :key="i" class="cloud" :cx="cx" :cy="cy" :r="r" />
    <g :mask="`url(#cloudMask${index})`">
      <circle
        v-for="({ cx, cy, r }, i) in circles"
        :key="i"
        class="highlight"
        :cx="cx"
        :cy="cy"
        :r="r"
      />
    </g>
  </g>
</template>

<style scoped>
circle {
  transition: all;
  transition-timing-function: linear;
  transition-duration: var(--transition-duration);
}

rect.mask {
  fill: white;
}

circle.mask {
  fill: black;
}

circle.cloud {
  fill: white;
  stroke: none;
}

circle.highlight {
  fill: rgb(136, 201, 211);
}
</style>
