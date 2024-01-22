<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'

import { buildNoiseProgram, drawNoise } from './noise'

const fps = ref(0)

const quality = ref(100)
const scrollPos = ref(0)

const normalisedMouseX = ref(0)
const normalisedMouseY = ref(0)

let animationId = 0

const handleMouseMove = (event: MouseEvent) => {
  const x = event.clientX
  const y = event.clientY
  normalisedMouseX.value = (x / window.innerWidth) * 2 - 1
  normalisedMouseY.value = -((y / window.innerHeight) * 2 - 1)
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
  window.addEventListener('scroll', handleScroll)
  handleScroll()

  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (canvas === null) return

  resizeCanvasToDisplaySize(canvas)

  const gl = canvas.getContext('webgl')
  if (gl === null) return

  const cubeProgramParams = buildNoiseProgram(gl)

  // ----------------------- ANIMATE -----------------------

  let frames = 0
  let framesStart = 0

  const animate = (delta: number) => {
    const t = delta / 5000

    resizeCanvasToDisplaySize(canvas, quality.value / 100)
    gl.viewport(0, 0, canvas.width, canvas.height)

    drawNoise(
      gl,
      {
        t,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
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
    <p>Scroll: {{ (scrollPos * 100).toFixed(2) }}%</p>
    <p>Mouse: {{ normalisedMouseX.toFixed(2) }}, {{ normalisedMouseY.toFixed(2) }}</p>
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
