<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'

import { buildCloudProgram, buildSkyProgram, drawClouds, drawSky } from './clouds'

import mountainsImageUrl from '@/assets/mountains_cropped.png'

const fps = ref(0)
const quality = ref(25)
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
  scrollPos.value =
    window.scrollY / (document.documentElement.scrollHeight - document.documentElement.clientHeight)
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

  const cloudProgramParams = buildCloudProgram(gl)
  const skyProgram = buildSkyProgram(gl)

  // ----------------------- ANIMATE -----------------------

  let frames = 0
  let framesStart = 0

  const animate = (delta: number) => {
    const t = delta / 8000

    resizeCanvasToDisplaySize(canvas, quality.value / 100)
    gl.viewport(0, 0, canvas.width, canvas.height)

    drawSky(gl, { scrollPct: scrollPos.value }, skyProgram)
    drawClouds(
      gl,
      {
        t,
        normalisedMouseX: normalisedMouseX.value,
        normalisedMouseY: normalisedMouseY.value,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        scrollPct: scrollPos.value
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
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <canvas id="canvas"></canvas>
  <div class="content" :style="{ backgroundImage: `url(${mountainsImageUrl})` }">
    <div class="textbox top">
      <h1>hello</h1>
    </div>
    <!--<div class="textbox bottom">
      <h1>end</h1>
    </div>-->
  </div>

  <div class="controls">
    <p>fps: {{ fps.toFixed(2) }}</p>
    <input type="range" min="1" max="200" v-model="quality" />
    <p>Quality: {{ (quality / 100).toFixed(2) }}</p>
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
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.content {
  position: absolute;
  top: 0px;
  width: 100%;
  height: 200%;
  background-repeat: no-repeat;
  background-position: bottom;
  background-size: contain;
}

.textbox {
  border-radius: 1rem;
  padding: 2rem 3rem;
  backdrop-filter: blur(10px);
  background-color: rgba(0, 0, 0, 0.2);
}

.top {
  position: absolute;
  top: 4rem;
  left: 50%;
  transform: translateX(-50%);
}

.bottom {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

h1 {
  font-family: 'Comfortaa', sans-serif;
  margin: 0;
  color: white;
  font-size: 5rem;
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

/*.background {
  position: absolute;
  bottom: 0px;
  width: 100%;
  height: 200px;
  background-color: red;
}*/
</style>
