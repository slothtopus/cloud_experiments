<script setup lang="ts">
import { onMounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'

// inspired by https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html

const VERTEX_SHADER = `
  // an attribute will receive data from a buffer
  attribute vec2 a_position;
 
  uniform vec2 u_resolution;
 
  void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;
 
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;
 
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`

const FRAGMENT_SHADER = `
  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
  precision mediump float;
 
  uniform vec4 u_color;

  void main() {
   gl_FragColor = u_color;
  }
`

const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  var shader = gl.createShader(type)
  if (shader === null) throw `gl.createShader(${type}) returned null`
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }
  gl.deleteShader(shader)
  throw `gl.COMPILE_STATUS = ${success}, gl.getShaderInfoLog() = ${gl.getShaderInfoLog(shader)}`
}

const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  var program = gl.createProgram()
  if (program === null) throw `gl.createProgram() returned null`
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }
  gl.deleteProgram(program)
  throw `gl.LINK_STATUS = ${success}, gl.getProgramInfoLog() = ${gl.getProgramInfoLog(program)}`
}

// Returns a random integer from 0 to range - 1.
const randomInt = (range: number) => {
  return Math.floor(Math.random() * range)
}

// Fills the buffer with the values that define a rectangle.
const setRectangle = (
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  var x1 = x
  var x2 = x + width
  var y1 = y
  var y2 = y + height

  // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
  // whatever buffer is bound to the `ARRAY_BUFFER` bind point
  // but so far we only have one buffer. If we had more than one
  // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  )
}

onMounted(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (canvas === null) return

  resizeCanvasToDisplaySize(canvas)

  var gl = canvas.getContext('webgl')
  if (gl === null) return

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const program = createProgram(gl, vertexShader, fragmentShader)

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // three 2d points
  //var positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30]
  //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // have to set uniform locations after we call use program
  // resolution
  var resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

  // colour
  var colourUniformLocation = gl.getUniformLocation(program, 'u_color')

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  gl.enableVertexAttribArray(positionAttributeLocation)

  const size = 2 // 2 components per iteration
  const type = gl.FLOAT // the data is 32bit floats
  const normalize = false // don't normalize the data
  const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0 // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  const primitiveType = gl.TRIANGLES
  const count = 6

  // draw 50 random rectangles in random colors
  for (var ii = 0; ii < 50; ++ii) {
    // Setup a random rectangle
    // This will write to positionBuffer because
    // its the last thing we bound on the ARRAY_BUFFER
    // bind point
    setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300))

    // Set a random color.
    gl.uniform4f(colourUniformLocation, Math.random(), Math.random(), Math.random(), 1)

    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  gl.drawArrays(primitiveType, offset, count)
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
