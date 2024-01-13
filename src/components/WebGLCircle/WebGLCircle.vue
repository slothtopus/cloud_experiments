<script setup lang="ts">
import { onMounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'

const VERTEX_SHADER = `
  // an attribute will receive data from a buffer
  attribute vec2 a_position;
 
  uniform vec2 u_resolution;
  varying vec2 v_position;
 
  void main() {
    v_position = a_position;
    vec2 aspectDivide = vec2(u_resolution.y / u_resolution.x, 1);
    gl_Position = vec4(a_position * aspectDivide, 0, 1);
  }
`

const FRAGMENT_SHADER = `
  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
  precision mediump float;
 
  //uniform vec4 u_color;
  varying vec2 v_position;

  void main() {
    float r = v_position.x*v_position.x + v_position.y*v_position.y;
    r = r * 4.0;
    if(r <= 1.0) {
        gl_FragColor = vec4(1, 0, 0, 1);
    } else {
        gl_FragColor = vec4(0, 0, 0, 0);
    }
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
  const infoLog = gl.getShaderInfoLog(shader)
  gl.deleteShader(shader)
  throw `gl.COMPILE_STATUS = ${success}, gl.getShaderInfoLog() = ${infoLog}`
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
  const infoLog = gl.getProgramInfoLog(program)
  gl.deleteProgram(program)
  throw `gl.LINK_STATUS = ${success}, gl.getProgramInfoLog() = ${infoLog}`
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

  // a square
  var positions = [-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

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

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  gl.enableVertexAttribArray(positionAttributeLocation)

  const size = 2 // 2 components per iteration
  const type = gl.FLOAT // the data is 32bit floats
  const normalize = false // don't normalize the data
  const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0 // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  gl.drawArrays(gl.TRIANGLES, 0, 6)
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
