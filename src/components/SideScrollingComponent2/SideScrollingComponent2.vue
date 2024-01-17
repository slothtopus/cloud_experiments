<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'
import { createProgram, createShader } from '../../lib/webgl'

// @ts-ignore
import VERTEX_SHADER from './vertex.glsl'
// @ts-ignore
import FRAGMENT_SHADER from './fragment_rand_spheres.glsl'

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

  const yStart = 0.5
  const rWidth = 1.7
  const rHeight = 0.8
  const xRange: [number, number] = [-10, 10]
  const n = 10

  const offsets = [
    // top triangle
    [0, 0, 0],
    [rWidth, 0, 0],
    [0, -rHeight, 0],
    // bottom triangle
    [0, -rHeight, 0],
    [rWidth, -rHeight, 0],
    [rWidth, 0, 0]
  ]

  const buildXStarts = (width: number, n: number, xRange: [number, number]) => {
    const d = xRange[1] - xRange[0]
    const totalGap = d - n * width

    const r = [...Array(n).keys()].map(() => Math.random() * 0.9 + 0.1)
    const rSum = r.reduce((s, x) => s + x, 0)
    const gaps = r.map((x) => (x / rSum) * totalGap)
    console.log('gaps = ', gaps)

    let xStart = xRange[0]
    const xStarts = []
    for (let i = 0; i < n; i++) {
      xStarts.push(xStart)
      xStart += width + gaps[i]
    }

    return xStarts
  }

  const xStarts = buildXStarts(rWidth, n, xRange)
  console.log('xStarts = ', xStarts)

  const aOffsets = [...Array(n).keys()].map(() => offsets.flatMap((x) => x)).flatMap((x) => x)
  const aTopLeft = xStarts
    .flatMap((x) => [x, x, x, x, x, x])
    .map((xStart) => [xStart, yStart])
    .flatMap((x) => x)

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
    console.log('aOffsets.length = ', aOffsets.length)
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
    console.log('aTopLeft.length = ', aTopLeft.length)
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
  gl.uniform2f(rectResolutionUniformLocation, rWidth, rHeight)
  const dUniformLocation = gl.getUniformLocation(program, 'u_d')
  gl.uniform1f(dUniformLocation, xRange[1] - xRange[0])

  const mouseUniformLocation = gl.getUniformLocation(program, 'u_mouse')

  // clouds
  const cloudSpheresUniform = gl.getUniformLocation(program, 'u_cloud_spheres')
  const spheres: number[] = []
  {
    const xRange: [number, number] = [-1, 1]
    const yRange: [number, number] = [-0.3, 0.4]
    const zRange: [number, number] = [-0.2, 0.35]
    const rRange: [number, number] = [0.4, 0.5]
    const points = 10

    //const midX = (xRange[0] + xRange[1]) / 2
    const gap = (xRange[1] - xRange[0]) / points
    const jitterNumber = (gap: number) => gap + (Math.random() - 0.5) * 0.5 * gap
    const randomInRange = (range: [number, number]) =>
      range[0] + Math.random() * (range[1] - range[0])

    for (let i = 0; i < points; i++) {
      spheres.push(
        xRange[0] + jitterNumber(gap) * i,
        randomInRange(yRange),
        randomInRange(zRange),
        randomInRange(rRange)
      )
    }
  }
  gl.uniform4fv(cloudSpheresUniform, spheres)

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
    gl.clearColor(0.14, 0.78, 0.89, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    resizeCanvasToDisplaySize(canvas, 1)
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
  <canvas id="canvas"></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
  /*image-rendering: pixelated;
  image-rendering: crisp-edges;*/
}

.fps {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
