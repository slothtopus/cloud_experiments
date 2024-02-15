import { createProgram, createShader } from '../../lib/webgl'

import {
  matrixToColumnMajorArray,
  createRotationMatrix4,
  inverseMatrix4,
  createTranslationMatrix4
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
  const worldTransformInverseLocation = gl.getUniformLocation(program, 'u_world_transform_inverse')
  const lightTransformLocation = gl.getUniformLocation(program, 'u_light_transform')
  const mousePosLocation = gl.getUniformLocation(program, 'u_mousepos')
  const timeLocation = gl.getUniformLocation(program, 'u_time')
  const vanishLocation = gl.getUniformLocation(program, 'u_vanish')

  console.log('getting texture')
  const response = await fetch('perlin_3d_T_128_128_10.bin')
  const textureBuffer = new Uint8Array(await response.arrayBuffer())
  console.log('got texture!')

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_3D, texture)

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  // Assuming the dimensions of each slice of your 3D texture are width x height
  gl.texImage3D(
    gl.TEXTURE_3D,
    0,
    gl.R8,
    128,
    128,
    128,
    0,
    gl.RED,
    gl.UNSIGNED_BYTE,
    new Uint8Array(textureBuffer)
  )

  return {
    program,
    bufferSetups,
    scrollUniformLocation,
    worldTransformInverseLocation,
    lightTransformLocation,
    resolutionUniformLocation,
    stepSizeUniformLocation,
    depthStepsLocation,
    timeLocation,
    mousePosLocation,
    vanishLocation
  }
}

export const draw = (
  gl: WebGL2RenderingContext,
  {
    t,
    canvasWidth,
    canvasHeight,
    draggedMouseX,
    draggedMouseY,
    normalisedMouseX,
    normalisedMouseY,
    depthSteps,
    stepSize,
    vanish
  }: {
    t: number
    canvasWidth: number
    canvasHeight: number
    draggedMouseX: number
    draggedMouseY: number
    normalisedMouseX: number
    normalisedMouseY: number
    depthSteps: number
    stepSize: number
    vanish: number
  },
  {
    program,
    bufferSetups,
    resolutionUniformLocation,
    worldTransformInverseLocation,
    mousePosLocation,
    timeLocation,
    depthStepsLocation,
    stepSizeUniformLocation,
    lightTransformLocation,
    vanishLocation
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

  const lm = createTranslationMatrix4(5 * normalisedMouseX, 10 * normalisedMouseY, 0)
  gl.uniformMatrix4fv(lightTransformLocation, false, matrixToColumnMajorArray(lm))

  gl.uniform1f(stepSizeUniformLocation, stepSize)
  gl.uniform1i(depthStepsLocation, depthSteps)
  gl.uniform1f(timeLocation, t)
  gl.uniform2fv(mousePosLocation, [normalisedMouseX, normalisedMouseY])
  gl.uniform1f(vanishLocation, vanish)

  gl.drawArrays(gl.TRIANGLES, 0, 6)
}
