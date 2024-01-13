<script setup lang="ts">
import { onMounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'
import { createProgram, createShader } from '@/lib/webgl'

const VERTEX_SHADER = `
  // an attribute will receive data from a buffer
  attribute vec3 a_position;

  uniform vec2 u_resolution;
  uniform mat4 u_projection;

  void main() {
    //gl_Position = u_matrix * vec4(a_position, 1);
    vec2 aspectDivide = vec2(u_resolution.y / u_resolution.x, 1);
    gl_Position = vec4(a_position.xy * aspectDivide, 0, 1);
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

  const SQUARE_LINES = [
    // line 1
    [0.5, 0.5, 0],
    [0.5, -0.5, 0],
    // line 2
    [0.5, -0.5, 0],
    [-0.5, -0.5, 0],
    // line 3
    [-0.5, -0.5, 0],
    [-0.5, 0.5, 0],
    //line 4
    [-0.5, 0.5, 0],
    [0.5, 0.5, 0]
  ]
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
  const positionBuffer = gl.createBuffer()

  const flattened = SQUARE_LINES.flatMap((x) => x)
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

  // have to set uniform locations after we call use program
  // resolution
  var resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

  gl.drawArrays(gl.LINES, 0, 8)
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
