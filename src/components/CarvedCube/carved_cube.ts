import { createProgram, createShader } from '../../lib/webgl'

import {
  matrixToColumnMajorArray,
  createTranslationMatrix4,
  createRotationMatrix4,
  multiplyMatrix4,
  inverseMatrix4
} from '@/lib/lib'

export const buildCubeProgram = async (
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
  const boxTransformInverseLocation = gl.getUniformLocation(program, 'u_box_transform_inverse')
  const lightTransformLocation = gl.getUniformLocation(program, 'u_light_transform')
  const mousePosLocation = gl.getUniformLocation(program, 'u_mousepos')
  const timeLocation = gl.getUniformLocation(program, 'u_time')

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
    boxTransformLocation,
    boxTransformInverseLocation,
    lightTransformLocation,
    resolutionUniformLocation,
    stepSizeUniformLocation,
    depthStepsLocation,
    timeLocation,
    mousePosLocation
  }
}

export const drawCube = (
  gl: WebGL2RenderingContext,
  {
    canvasWidth,
    canvasHeight,
    mouseX,
    mouseY,
    draggedX,
    draggedY,
    t,
    stepSize,
    depthSteps
  }: {
    canvasWidth: number
    canvasHeight: number
    mouseX: number
    mouseY: number
    draggedX: number
    draggedY: number
    t: number
    stepSize: number
    depthSteps: number
  },
  {
    program,
    bufferSetups,
    boxTransformLocation,
    boxTransformInverseLocation,
    lightTransformLocation,
    resolutionUniformLocation,
    stepSizeUniformLocation,
    depthStepsLocation,
    mousePosLocation,
    timeLocation
  }: Awaited<ReturnType<typeof buildCubeProgram>>
) => {
  gl.useProgram(program)
  bufferSetups.forEach((b) => b())

  gl.uniform2fv(resolutionUniformLocation, [canvasWidth, canvasHeight])

  const m = multiplyMatrix4(
    createTranslationMatrix4(0, 0, -10),
    //createRotationMatrix4((t * Math.PI) / 2, (t * Math.PI) / 3, (t * Math.PI) / 4)
    createRotationMatrix4(draggedY * Math.PI, draggedX * -Math.PI, 0)
  )
  gl.uniformMatrix4fv(boxTransformLocation, false, matrixToColumnMajorArray(m))
  gl.uniformMatrix4fv(
    boxTransformInverseLocation,
    false,
    matrixToColumnMajorArray(inverseMatrix4(m))
  )

  const lm = createTranslationMatrix4(20 * mouseX, 40 * mouseY, 0)
  gl.uniformMatrix4fv(lightTransformLocation, false, matrixToColumnMajorArray(lm))

  gl.uniform1f(stepSizeUniformLocation, stepSize)
  gl.uniform1i(depthStepsLocation, depthSteps)
  gl.uniform1f(timeLocation, t)
  gl.uniform2fv(mousePosLocation, [mouseX, mouseY])

  gl.drawArrays(gl.TRIANGLES, 0, 6)
}
