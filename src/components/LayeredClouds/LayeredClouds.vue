<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'

import { buildCloudProgram, drawClouds, buildSkyProgram, drawSky } from './clouds'

const fps = ref(0)
const quality = ref(50)
let animationId = 0

onMounted(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (canvas === null) return

  resizeCanvasToDisplaySize(canvas)

  const gl = canvas.getContext('webgl')
  if (gl === null) return

  const skyProgramParams = buildSkyProgram(gl)
  const cloudProgramParams = buildCloudProgram(gl)

  // ----------------------- ANIMATE -----------------------

  let normalisedMouseX = 0
  let normalisedMouseY = 0
  window.addEventListener('mousemove', (event: MouseEvent) => {
    const x = event.clientX
    const y = event.clientY
    normalisedMouseX = (x / window.innerWidth) * 2 - 1
    normalisedMouseY = -((y / window.innerHeight) * 2 - 1)
  })

  let frames = 0
  let framesStart = 0

  const animate = (delta: number) => {
    const t = delta / 8000

    resizeCanvasToDisplaySize(canvas, quality.value / 100)
    gl.viewport(0, 0, canvas.width, canvas.height)

    drawSky(gl, skyProgramParams)
    drawClouds(
      gl,
      {
        t,
        normalisedMouseX,
        normalisedMouseY,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      },
      cloudProgramParams
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
})
</script>

<template>
  <canvas id="canvas"></canvas>
  <div class="controls">
    <p>fps: {{ fps.toFixed(2) }}</p>
    <input type="range" min="1" max="200" v-model="quality" />
    <p>Quality: {{ (quality / 100).toFixed(2) }}</p>
  </div>
  <div class="title">
    <h1>clouds</h1>
  </div>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
  /*image-rendering: pixelated;
  image-rendering: crisp-edges;*/
}

.controls {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  color: white;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
}

.controls p {
  margin: 0;
  text-align: center;
}

.title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /*border: 1px solid white;*/

  border-radius: 1rem;
  padding: 2rem 3rem;
  backdrop-filter: blur(10px);
  background-color: rgba(0, 0, 0, 0.2);
}

h1 {
  font-family: 'Comfortaa', sans-serif;
  margin: 0;
  color: white;
  font-size: 5rem;
}
</style>
