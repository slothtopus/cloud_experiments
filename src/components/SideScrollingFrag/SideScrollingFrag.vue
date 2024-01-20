<script setup lang="ts">
import { onMounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'
import { createProgram, createShader } from '../../lib/webgl'

import VERTEX_SHADER from './vertex.glsl'
import FRAGMENT_SHADER from './fragment.glsl'

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
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
  const positionBuffer = gl.createBuffer()

  const positions = [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(positionAttributeLocation)

  const size = 2 // 3 components per iteration
  const type = gl.FLOAT // the data is 32bit floats
  const normalize = false // don't normalize the data
  const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0 // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // ----------------------- UNIFORMS -----------------------
  // have to set uniform locations after we call use program
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  const timeUniform = gl.getUniformLocation(program, 'u_time')
  const randomUniform = gl.getUniformLocation(program, 'u_random')
  gl.uniform1fv(randomUniform, [...Array(200).keys()].map(Math.random))

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

    gl.drawArrays(gl.TRIANGLES, 0, 6)
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
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
