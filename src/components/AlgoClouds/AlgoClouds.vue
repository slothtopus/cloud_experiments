<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AlgoCloud from './AlgoCloud.vue'

export type Cloud = {
  cx: number
  cy: number
  width: number
  height: number
  points: number
  element: SVGGraphicsElement | undefined
}

const clouds = ref<Cloud[]>([
  { cx: 1000, cy: 500, width: 400, height: 200, points: 25, element: undefined }
])

const svgDims = ref({ x: 0, y: 0, width: 0, height: 0 })
const transformPoint = (matrix: DOMMatrix, x: number, y: number) => {
  var p = new DOMPoint(x, y)
  return p.matrixTransform(matrix)
}
const calculateSvgDims = () => {
  const svgElem = document.getElementById('svg-element')
  if (svgElem !== null && svgElem instanceof SVGGraphicsElement) {
    const matrix = svgElem.getScreenCTM()?.inverse()
    if (matrix !== undefined) {
      const topLeft = transformPoint(matrix, 0, 0)
      const bottomRight = transformPoint(matrix, window.innerWidth, window.innerHeight)
      svgDims.value = {
        x: topLeft.x,
        y: topLeft.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y
      }
    }
  }
}

onMounted(() => {
  calculateSvgDims()
  window.addEventListener('resize', calculateSvgDims)
  requestAnimationFrame(animate)
})

const setItemRef = (el: unknown, i: number) => {
  if (el instanceof SVGGraphicsElement) {
    clouds.value[i].element = el
  }
}

let cumulativeTimestamp: number = 0
let lastTimestamp: number
const animate = (timestamp: number) => {
  if (lastTimestamp !== undefined) {
    const timestampDiff = timestamp - lastTimestamp
    cumulativeTimestamp += timestampDiff
    clouds.value = clouds.value.filter((c) => updateCloud(c, timestampDiff))
    if (cumulativeTimestamp > 2000) {
      /*const newWidth = 200 + Math.random() * 200
      const newHeight = 100 + 100 * Math.random()
      const newPoints = 5 + Math.floor(Math.random() * 10)
      const newCy = Math.random() * svgDims.value.height
      clouds.value.push({
        cx: svgDims.value.width + newWidth,
        cy: newCy,
        width: newWidth,
        height: newHeight,
        points: newPoints,
        element: undefined
      })*/
      cumulativeTimestamp = 0
    }
  }
  lastTimestamp = timestamp
  requestAnimationFrame(animate)
}

const updateCloud = (cloud: Cloud, timestampDiff: number) => {
  cloud.cx = cloud.cx - timestampDiff / 10
  if (cloud.element !== undefined) {
    const bbox = cloud.element.getBBox()
    return bbox.x + bbox.width > svgDims.value.x
  } else {
    return true
  }
}
</script>

<template>
  <svg id="svg-element" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
    <g v-for="(cloud, i) in clouds" :key="i" :ref="(el) => setItemRef(el, i)">
      <AlgoCloud
        :index="1"
        :cx="cloud.cx"
        :cy="cloud.cy"
        :width="cloud.width"
        :height="cloud.height"
        :points="5"
      />
    </g>
  </svg>
</template>

<style scoped>
svg {
  background-color: rgb(36, 199, 228);
  display: block;
  width: 100%;
  height: 100%;
}
</style>
