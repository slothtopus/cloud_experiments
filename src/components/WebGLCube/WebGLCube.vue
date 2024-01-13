<script setup lang="ts">
import { onMounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'
import { createProgram, createShader } from '@/lib/webgl'

import {
  CUBE_LINES,
  createTranslationMatrix4,
  createFrustrumProjectionMatrix,
  multiplyMatrix4,
  matrixToColumnMajorArray
} from './lib'

const VERTEX_SHADER = `
  // an attribute will receive data from a buffer
  attribute vec3 a_position;

  uniform vec2 u_resolution;
  uniform mat4 u_projection;

  void main() {
    vec4 p = u_projection * vec4(a_position, 1.);
    vec4 n = vec4(p.x / p.w * u_resolution.y / u_resolution.x, p.yzw / p.w);
    gl_Position = n;
  }
`

const FRAGMENT_SHADER = `
  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
  precision mediump float;

  void main() {
    gl_FragColor = vec4(1, 0, 0, 1);
  }
`

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

  const flattened = CUBE_LINES.flatMap((x) => x)

  console.log(flattened)

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flattened), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(positionAttributeLocation)

  const size = 3 // 3 components per iteration
  const type = gl.FLOAT // the data is 32bit floats
  const normalize = false // don't normalize the data
  const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0 // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // ----------------------- UNIFORMS -----------------------
  // have to set uniform locations after we call use program

  // resolution
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

  // projection + transform
  const projectionUniformLocation = gl.getUniformLocation(program, 'u_projection')
  // translate points to push them back to z = -1
  const pm = createFrustrumProjectionMatrix(-1, 1, -1, 1, 1, 2)
  const tm = createTranslationMatrix4(0, 0, -1.5)
  // our transform in the vertex shader will be: pm * tm * point
  const finalMatrix = multiplyMatrix4(pm, tm)
  gl.uniformMatrix4fv(projectionUniformLocation, false, matrixToColumnMajorArray(finalMatrix))

  // ----------------------- DRAW -----------------------
  gl.drawArrays(gl.LINES, 0, flattened.length / 3)
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
