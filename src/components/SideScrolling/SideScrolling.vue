<script setup lang="ts">
import { onMounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'
import { createProgram, createShader } from '@/lib/webgl'

import VERTEX_SHADER from './vertex.glsl'
import FRAGMENT_SHADER from './fragment_cloud.glsl'

/*import {
  createTranslationMatrix4,
  createFrustrumProjectionMatrix,
  multiplyMatrix4,
  matrixToColumnMajorArray
} from './lib'*/

onMounted(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (canvas === null) return

  resizeCanvasToDisplaySize(canvas)

  var gl = canvas.getContext('webgl')
  if (gl === null) return

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const program = createProgram(gl, vertexShader, fragmentShader)

  // ----------------------- VERTICES -----------------------
  const POINTS = 50
  const MAX_OFFSET = 5
  const MAX_GAP = MAX_OFFSET / POINTS

  const seeds: number[] = []
  const jitterNumber = (gap: number) => gap + (Math.random() - 0.5) * 0.5 * gap
  let seed = 0
  for (let i = 0; i < POINTS; i++) {
    seed += jitterNumber(MAX_GAP)
    seeds.push(seed)
  }

  const triangleSeeds = seeds.flatMap((x) => Array(6).fill(x))

  const halfWidth = 0.2
  const halfHeight = 0.15
  const triangleOffsets = seeds.flatMap((x, i) => {
    const z = -(i % 3) - 1
    return [
      // top left triangle
      [-halfWidth, halfHeight, z],
      [halfWidth, halfHeight, z],
      [-halfWidth, -halfHeight, z],

      // bottom right triangle
      [-halfWidth, -halfHeight, z],
      [halfWidth, -halfHeight, z],
      [halfWidth, halfHeight, z]
    ].flatMap((x) => x)
  })

  console.log('offsetTriangles = ', triangleSeeds)
  console.log('offsetTriangleTypes = ', triangleOffsets)

  {
    const attribLocation = gl.getAttribLocation(program, 'seed')
    const attribBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleSeeds), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(attribLocation)
    const size = 1 // 1 component per iteration
    const type = gl.FLOAT // the data is 32bit floats
    const normalize = false // don't normalize the data
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(attribLocation, size, type, normalize, stride, offset)
  }

  {
    const attribLocation = gl.getAttribLocation(program, 'offset')
    const attribBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleOffsets), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(attribLocation)
    const size = 3 // 1 component per iteration
    const type = gl.FLOAT // the data is 32bit floats
    const normalize = false // don't normalize the data
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(attribLocation, size, type, normalize, stride, offset)
  }

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // ----------------------- UNIFORMS -----------------------
  // have to set uniform locations after we call use program

  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  const timeUniform = gl.getUniformLocation(program, 't_global')

  const randomUniform = gl.getUniformLocation(program, 'u_random')
  gl.uniform1fv(randomUniform, [...Array(100).keys()].map(Math.random))

  const xRange: [number, number] = [-1, 1]
  const yRange: [number, number] = [-0.3, 0.4]
  const zRange: [number, number] = [-0.2, 0.35]
  const rRange: [number, number] = [0.4, 0.5]
  const points = 10

  //const midX = (xRange[0] + xRange[1]) / 2
  const gap = (xRange[1] - xRange[0]) / points
  const randomInRange = (range: [number, number]) =>
    range[0] + Math.random() * (range[1] - range[0])

  const spheres: number[] = []
  for (let i = 0; i < points; i++) {
    spheres.push(
      xRange[0] + jitterNumber(gap) * i,
      randomInRange(yRange),
      randomInRange(zRange),
      randomInRange(rRange)
    )
  }

  const cloudSpheresUniform = gl.getUniformLocation(program, 'cloud_spheres')
  gl.uniform4fv(cloudSpheresUniform, spheres)

  // ----------------------- ANIMATE -----------------------
  const animate = (delta: number) => {
    const t = delta / 10000
    if (gl === null) return

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    resizeCanvasToDisplaySize(canvas)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)
    gl.uniform1f(timeUniform, t)

    gl.drawArrays(gl.TRIANGLES, 0, triangleSeeds.length)
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)

  gl.drawArrays(gl.TRIANGLES, 0, triangleSeeds.length)
})
</script>

<template>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>
