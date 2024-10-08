<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'

import { buildCubeProgram, drawCube } from './lit_perlin_cube'

const fps = ref(0)

const quality = ref(25)
const scrollPos = ref(0)
const stepSize = ref(10)
const depthSteps = ref(50)

const normalisedMouseX = ref(0)
const normalisedMouseY = ref(0)
const draggedMouseX = ref(0)
const draggedMouseY = ref(0)
const mouseDown = ref(false)

let animationId = 0

let lastMouseX: undefined | number = undefined
let lastMouseY: undefined | number = undefined

const normaliseScreenCoords = (x: number, y: number): [number, number] => [
  (x / window.innerWidth) * 2 - 1,
  -((y / window.innerHeight) * 2 - 1)
]
const handleMouseMove = (event: MouseEvent) => {
  const [normX, normY] = normaliseScreenCoords(event.clientX, event.clientY)
  normalisedMouseX.value = normX
  normalisedMouseY.value = normY
  if (mouseDown.value) {
    if (lastMouseX !== undefined && lastMouseY !== undefined) {
      const [lastNormX, lastNormY] = normaliseScreenCoords(lastMouseX, lastMouseY)
      draggedMouseX.value += normX - lastNormX
      draggedMouseY.value += normY - lastNormY
    }
  }
  lastMouseX = event.clientX
  lastMouseY = event.clientY
}

const handleMouseDown = () => {
  mouseDown.value = true
}

const handleMouseUp = () => {
  mouseDown.value = false
}

const handleScroll = () => {
  const visibleHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight
  if (visibleHeight != 0) {
    scrollPos.value = window.scrollY / visibleHeight
  } else {
    scrollPos.value = 0
  }
}
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('scroll', handleScroll)
  handleScroll()

  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (canvas === null) return

  resizeCanvasToDisplaySize(canvas)

  const gl = canvas.getContext('webgl')
  if (gl === null) return

  const cubeProgramParams = buildCubeProgram(gl)

  // ----------------------- ANIMATE -----------------------

  let frames = 0
  let framesStart = 0

  const animate = (delta: number) => {
    const t = delta / 5000

    resizeCanvasToDisplaySize(canvas, quality.value / 100)
    gl.viewport(0, 0, canvas.width, canvas.height)

    drawCube(
      gl,
      {
        t,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        stepSize: stepSize.value / 100,
        depthSteps: depthSteps.value,
        mouseX: normalisedMouseX.value,
        mouseY: normalisedMouseY.value,
        draggedX: draggedMouseX.value,
        draggedY: draggedMouseY.value
      },
      cubeProgramParams
    )
    animationId = requestAnimationFrame(animate)

    frames += 1
    if (frames == 100) {
      fps.value = 1000 / ((delta - framesStart) / 100)
      frames = 0
      framesStart = delta
    }
  }
  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.cancelAnimationFrame(animationId)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <canvas id="canvas"></canvas>
  <div class="controls">
    <p>fps: {{ fps.toFixed(2) }}</p>
    <hr />
    <input type="range" min="1" max="200" v-model="quality" />
    <p>Quality: {{ (quality / 100).toFixed(2) }}</p>
    <hr />
    <input type="range" min="1" max="20" v-model="stepSize" />
    <p>Stepsize: {{ (stepSize / 100).toFixed(2) }}</p>
    <hr />
    <input type="range" min="1" max="500" v-model="depthSteps" />
    <p>Depth steps: {{ depthSteps }}</p>
    <hr />
    <p>Scroll: {{ (scrollPos * 100).toFixed(2) }}%</p>
    <p>Mouse: {{ normalisedMouseX.toFixed(2) }}, {{ normalisedMouseY.toFixed(2) }}</p>
    <p>Dragged: {{ draggedMouseX.toFixed(2) }}, {{ draggedMouseY.toFixed(2) }}</p>
  </div>
</template>

<style scoped>
canvas {
  position: fixed;
  inset: 0px;
  width: 100%;
  height: 100%;
  /*image-rendering: pixelated;
  image-rendering: crisp-edges;*/
}
.controls {
  position: fixed;
  top: 0.25rem;
  right: 0.25rem;
  color: white;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.75);
}

.controls p {
  margin: 0;
  text-align: center;
}
</style>
