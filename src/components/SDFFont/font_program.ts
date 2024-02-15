import { createProgram, createShader } from '../../lib/webgl'

import {
  matrixToColumnMajorArray,
  createTranslationMatrix4,
  createRotationMatrix4,
  multiplyMatrix4,
  inverseMatrix4
} from '@/lib/lib'

export const buildProgram = async (
  gl: WebGL2RenderingContext,
  VERTEX_SHADER: string,
  FRAGMENT_SHADER: string
) => {
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
  const stepSizeUniformLocation = gl.getUniformLocation(program, 'u_stepsize')
  const depthStepsLocation = gl.getUniformLocation(program, 'u_max_depth_steps')
  const boxTransformLocation = gl.getUniformLocation(program, 'u_box_transform')
  const worldTransformInverseLocation = gl.getUniformLocation(program, 'u_world_transform_inverse')
  const lightTransformLocation = gl.getUniformLocation(program, 'u_light_transform')
  const mousePosLocation = gl.getUniformLocation(program, 'u_mousepos')
  const timeLocation = gl.getUniformLocation(program, 'u_time')

  return {
    program,
    bufferSetups,
    scrollUniformLocation,
    boxTransformLocation,
    worldTransformInverseLocation,
    lightTransformLocation,
    resolutionUniformLocation,
    stepSizeUniformLocation,
    depthStepsLocation,
    timeLocation,
    mousePosLocation
  }
}

export const draw = (
  gl: WebGL2RenderingContext,
  {
    canvasWidth,
    canvasHeight,
    draggedMouseX,
    draggedMouseY
  }: {
    canvasWidth: number
    canvasHeight: number
    draggedMouseX: number
    draggedMouseY: number
  },
  {
    program,
    bufferSetups,
    resolutionUniformLocation,
    worldTransformInverseLocation
  }: Awaited<ReturnType<typeof buildProgram>>
) => {
  gl.useProgram(program)
  bufferSetups.forEach((b) => b())
  gl.uniform2fv(resolutionUniformLocation, [canvasWidth, canvasHeight])

  const m = createRotationMatrix4(draggedMouseY * Math.PI, draggedMouseX * -Math.PI, 0)
  gl.uniformMatrix4fv(
    worldTransformInverseLocation,
    false,
    matrixToColumnMajorArray(inverseMatrix4(m))
  )

  gl.drawArrays(gl.TRIANGLES, 0, 6)
}
