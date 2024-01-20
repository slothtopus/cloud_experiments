<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'
import { createProgram, createShader } from '../../lib/webgl'

import { buildCloudRow } from './clouds'

// @ts-ignore
import VERTEX_SHADER from './vertex.glsl'
// @ts-ignore
import FRAGMENT_SHADER from './fragment_rand_cloud.glsl'

const fps = ref(0)

onMounted(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (canvas === null) return

  resizeCanvasToDisplaySize(canvas)

  const gl = canvas.getContext('webgl')
  if (gl === null) return

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const program = createProgram(gl, vertexShader, fragmentShader)

  // ----------------------- VERTICES -----------------------

  const rectHeight = 0.7
  const rectWidth = 1.7
  const xRange: [number, number] = [-10, 10]
  const d = xRange[1] - xRange[0]

  let aOffsets: number[] = []
  let aTopLeft: number[] = []

  // [yTopLeft, z, nCloud]
  const cloudRows = [
    [1, -2, 12],
    [-0.3, -2, 12],
    [0.35, -1.5, 12],
    [1, -1, 12],
    [-0.3, -1, 12]
  ]

  for (const [yTopLeft, z, nCloud] of cloudRows) {
    const { aOffsets: aOffsetsNew, aTopLeft: aTopLeftNew } = buildCloudRow(
      yTopLeft,
      z,
      rectWidth,
      rectHeight,
      xRange,
      nCloud
    )
    aOffsets.push(...aOffsetsNew)
    aTopLeft.push(...aTopLeftNew)
  }

  const offsetAttributeLocation = gl.getAttribLocation(program, 'a_offsets')
  const offsetBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer)
  gl.enableVertexAttribArray(offsetAttributeLocation)

  {
    const size = 3 // 3 components per iteration
    const type = gl.FLOAT // the data is 32bit floats
    const normalize = false // don't normalize the data
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0 // start at the beginning of the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(aOffsets), gl.STATIC_DRAW)
    gl.vertexAttribPointer(offsetAttributeLocation, size, type, normalize, stride, offset)
  }

  const topleftAttributeLocation = gl.getAttribLocation(program, 'a_topleft')
  const topleftBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, topleftBuffer)
  gl.enableVertexAttribArray(topleftAttributeLocation)

  {
    const size = 2 // 2 components per iteration
    const type = gl.FLOAT // the data is 32bit floats
    const normalize = false // don't normalize the data
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0 // start at the beginning of the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(aTopLeft), gl.STATIC_DRAW)
    gl.vertexAttribPointer(topleftAttributeLocation, size, type, normalize, stride, offset)
  }

  console.log(aOffsets, aTopLeft)
  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // ----------------------- UNIFORMS -----------------------
  // have to set uniform locations after we call use program
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_screen_resolution')
  const timeUniform = gl.getUniformLocation(program, 'u_time')
  const rectResolutionUniformLocation = gl.getUniformLocation(program, 'u_rect_resolution')
  gl.uniform2f(rectResolutionUniformLocation, rectWidth, rectHeight)
  const dUniformLocation = gl.getUniformLocation(program, 'u_d')
  gl.uniform1f(dUniformLocation, d)
  const zDepthUniformLocation = gl.getUniformLocation(program, 'u_zdepth')
  gl.uniform1f(zDepthUniformLocation, 2)

  const mouseUniformLocation = gl.getUniformLocation(program, 'u_mouse')

  // ----------------------- TEXTURE -----------------------

  // Create a texture.
  var texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    128,
    128,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([...Array(128 * 128 * 4).keys()].map((x) => Math.floor(Math.random() * 255)))
  )

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  // ----------------------- ANIMATE -----------------------

  let normalisedMouseX = 0
  let normalisedMouseY = 0
  window.addEventListener('mousemove', (event: MouseEvent) => {
    const x = event.clientX
    const y = event.clientY

    // Normalize the coordinates
    // Convert x to the range [-1, 1], based on window width
    // Convert y to the range [-1, 1], based on window height
    // Invert the y-axis to match the convention (positive upwards)
    normalisedMouseX = (x / window.innerWidth) * 2 - 1
    normalisedMouseY = -((y / window.innerHeight) * 2 - 1)
  })

  let frames = 0
  let framesStart = 0

  const animate = (delta: number) => {
    const t = delta / 8000
    if (gl === null) return

    //       gl_FragColor = vec4(0.14, 0.78, 0.89, 1);
    //gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.clearColor(0.14, 0.78, 0.89, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    resizeCanvasToDisplaySize(canvas, 0.75)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)
    gl.uniform1f(timeUniform, t)
    gl.uniform2fv(mouseUniformLocation, [normalisedMouseX, normalisedMouseY])

    gl.drawArrays(gl.TRIANGLES, 0, aOffsets.length / 3)
    requestAnimationFrame(animate)

    frames += 1
    if (frames == 100) {
      fps.value = 1000 / ((delta - framesStart) / 100)
      frames = 0
      framesStart = delta
    }
  }
  requestAnimationFrame(animate)
  //animate(0)
})
</script>

<template>
  <div class="fps">
    <p>fps: {{ fps.toFixed(2) }}</p>
  </div>
  <h1>Clouds!</h1>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.fps {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

h1 {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: yellow;
  font-size: 3rem;
}
</style>
