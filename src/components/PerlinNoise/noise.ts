import { createProgram, createShader } from '../../lib/webgl'

/*import {
  matrixToColumnMajorArray,
  createTranslationMatrix4,
  createRotationMatrix4,
  multiplyMatrix4,
  inverseMatrix4,
  createScaleMatrix4
} from '@/lib/lib'*/

import VERTEX_SHADER from './vertex_quad.glsl'
import FRAGMENT_SHADER from './fragment_noise.glsl'

export const buildNoiseProgram = (gl: WebGLRenderingContext) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)

  const program = createProgram(gl, vertexShader, fragmentShader)
  gl.useProgram(program)

  const bufferSetups: (() => void)[] = []

  const quadBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1]),
    gl.STATIC_DRAW
  )
  const quadAttributeLocation = gl.getAttribLocation(program, 'a_quad')

  bufferSetups.push(() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
    gl.enableVertexAttribArray(quadAttributeLocation)
    gl.vertexAttribPointer(quadAttributeLocation, 2, gl.FLOAT, false, 0, 0)
  })

  const scrollUniformLocation = gl.getUniformLocation(program, 'u_scroll_pct')
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  const timeUniformLocation = gl.getUniformLocation(program, 'u_time')

  return {
    program,
    bufferSetups,
    scrollUniformLocation,
    resolutionUniformLocation,
    timeUniformLocation
  }
}

export const drawNoise = (
  gl: WebGLRenderingContext,
  { canvasWidth, canvasHeight, t }: { canvasWidth: number; canvasHeight: number; t: number },
  {
    program,
    bufferSetups,
    resolutionUniformLocation,
    timeUniformLocation
  }: ReturnType<typeof buildNoiseProgram>
) => {
  gl.useProgram(program)
  bufferSetups.forEach((b) => b())
  gl.uniform2fv(resolutionUniformLocation, [canvasWidth, canvasHeight])
  gl.uniform1f(timeUniformLocation, t)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}
