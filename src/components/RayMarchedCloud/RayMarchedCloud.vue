<script setup lang="ts">
import { onMounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'
import { createProgram, createShader } from '../../lib/webgl'

import { createRotationMatrix4, matrixToColumnMajorArray } from './lib'

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
  /*const light1UniformLocation = gl.getUniformLocation(program, 'u_light1_transform')
  const light2UniformLocation = gl.getUniformLocation(program, 'u_light2_transform')
  const light3UniformLocation = gl.getUniformLocation(program, 'u_light3_transform')*/
  const cloudSpheresUniform = gl.getUniformLocation(program, 'cloud_spheres')
  const timeUniform = gl.getUniformLocation(program, 't')

  const xRange = [-1, 1]
  const yRange = [-0.3, 0.4]
  const zRange = [-0.2, 0.35]
  const rRange = [0.4, 0.5]
  const points = 10

  //const midX = (xRange[0] + xRange[1]) / 2
  const gap = (xRange[1] - xRange[0]) / points
  const jitterNumber = (gap: number) => gap + (Math.random() - 0.5) * 0.5 * gap
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

  gl.uniform4fv(cloudSpheresUniform, spheres)

  // ----------------------- ANIMATE -----------------------

  const animate = (delta: number) => {
    const t = delta / 1000
    if (gl === null) return

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    resizeCanvasToDisplaySize(canvas)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)
    gl.uniform1f(timeUniform, t)
    /*const rm1 = createRotationMatrix4(t * 3 * Math.PI, 0, 0)
    gl.uniformMatrix4fv(light1UniformLocation, false, matrixToColumnMajorArray(rm1))

    const rm2 = createRotationMatrix4(0, t * 2.5 * Math.PI, 0)
    gl.uniformMatrix4fv(light2UniformLocation, false, matrixToColumnMajorArray(rm2))

    const rm3 = createRotationMatrix4(0, 0, t * 5 * Math.PI)
    gl.uniformMatrix4fv(light3UniformLocation, false, matrixToColumnMajorArray(rm3))*/

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
