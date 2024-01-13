<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'
import { createProgram, createShader } from '@/lib/webgl'

import {
  CUBE_TRIANGLES,
  CUBE_TRIANGLE_COLOURS,
  createTranslationMatrix4,
  createRotationMatrix4,
  createFrustrumProjectionMatrix,
  multiplyMatrix4,
  matrixToColumnMajorArray
} from './lib'

const VERTEX_SHADER = `
  // an attribute will receive data from a buffer
  attribute vec3 a_position;
  attribute vec4 a_colour;

  uniform vec2 u_resolution;
  uniform mat4 u_projection;

  varying vec4 v_colour;

  void main() {
    vec4 p = u_projection * vec4(a_position, 1.);
    vec4 n;
    if(u_resolution.x > u_resolution.y) {
      n = vec4(
        p.x / p.w * u_resolution.y / u_resolution.x,
        p.yzw / p.w
      );
    } else {
      n = vec4(
        p.x / p.w,
        p.y / p.w * u_resolution.x / u_resolution.y,
        p.zw / p.w
      );
    }
    
    gl_Position = n;
    v_colour = a_colour;
  }
`

const FRAGMENT_SHADER = `
  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
  precision mediump float;

  varying vec4 v_colour;

  void main() {
    gl_FragColor = v_colour;
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

  const flattenedVertices = CUBE_TRIANGLES.flatMap((x) => x)

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flattenedVertices), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(positionAttributeLocation)

  {
    const size = 3 // 3 components per iteration
    const type = gl.FLOAT // the data is 32bit floats
    const normalize = false // don't normalize the data
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
  }

  // ----------------------- COLOURS -----------------------
  var colourLocation = gl.getAttribLocation(program, 'a_colour')
  const colourBuffer = gl.createBuffer()
  const flattenedColours = CUBE_TRIANGLE_COLOURS.flatMap((x) => x)

  gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(flattenedColours), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(colourLocation)

  {
    const size = 3 // 3 components per iteration
    const type = gl.UNSIGNED_BYTE // the data is 8bit unsigned values
    const normalize = true // normalize the data (convert from 0-255 to 0-1)
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(colourLocation, size, type, normalize, stride, offset)
  }

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // ----------------------- UNIFORMS -----------------------
  // have to set uniform locations after we call use program

  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  const projectionUniformLocation = gl.getUniformLocation(program, 'u_projection')

  // ----------------------- ANIMATE -----------------------

  const animate = (delta: number) => {
    const t = delta / 20000
    if (gl === null) return

    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    resizeCanvasToDisplaySize(canvas)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)

    const zDistance = 1 + zDistanceAdjust.value / 100
    const cubeSize = 1 / zDistance
    const pm = createFrustrumProjectionMatrix(-cubeSize, cubeSize, -cubeSize, cubeSize, 1, 10)
    const tm = createTranslationMatrix4(0, 0, -zDistance)
    const rm = createRotationMatrix4(2 * Math.PI * t, 6 * Math.PI * t, 4 * Math.PI * t)
    const finalMatrix = multiplyMatrix4(pm, multiplyMatrix4(tm, rm))
    gl.uniformMatrix4fv(projectionUniformLocation, false, matrixToColumnMajorArray(finalMatrix))

    gl.drawArrays(gl.TRIANGLES, 0, flattenedVertices.length / 3)
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
})

const zDistanceAdjust = ref(100)
</script>

<template>
  <div class="controls">
    <input type="range" min="1" max="300" v-model="zDistanceAdjust" />
    <p>{{ (1 + zDistanceAdjust / 100).toFixed(2) }}</p>
  </div>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
