<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'

import { buildNoiseProgram, drawNoise } from './texture_noise'

const webglVersion = ref('')
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
onMounted(async () => {
  console.log('getting texture')
  const response = await fetch('perlin_3d_T_128_128_10.bin')
  const textureBuffer = new Uint8Array(await response.arrayBuffer())
  console.log('got texture!')
  console.log(textureBuffer)

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('scroll', handleScroll)
  handleScroll()

  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (canvas === null) return

  resizeCanvasToDisplaySize(canvas)

  const gl = canvas.getContext('webgl2')
  if (gl === null) return
  webglVersion.value = gl.getParameter(gl.VERSION)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_3D, texture)

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  // Assuming the dimensions of each slice of your 3D texture are width x height
  gl.texImage3D(
    gl.TEXTURE_3D,
    0,
    gl.R8,
    128,
    128,
    128,
    0,
    gl.RED,
    gl.UNSIGNED_BYTE,
    new Uint8Array(textureBuffer)
  )

  const cubeProgramParams = buildNoiseProgram(gl)

  // ----------------------- ANIMATE -----------------------

  let frames = 0
  let framesStart = 0

  const animate = (delta: number) => {
    const t = delta / 10000

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
    <p>{{ webglVersion }}</p>
    <hr />
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
  padding: 6px;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 6px;
}
.controls input {
  width: 100%;
}

.controls p {
  margin: 0;
  text-align: center;
}
</style>
