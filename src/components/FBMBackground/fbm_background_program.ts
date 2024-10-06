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

  //['fbm_noise_512_512_5_5.bin', 'perlin_noise_512_512_6.bin']

  // create 2 textures
  const textures = []
  for (const fname of ['fbm_noise_512_512_5_5.bin', 'perlin_noise_512_512_6.bin']) {
    console.log('getting texture: ', fname)
    const response = await fetch(fname)
    const buffer = new Uint8Array(await response.arrayBuffer())

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    // Assuming the dimensions of each slice of your 3D texture are width x height
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 512, 512, 0, gl.RED, gl.UNSIGNED_BYTE, buffer)
    textures.push(texture)
    console.log(textures)
    console.log('done')
  }

  // lookup the sampler locations.
  const u_image0Location = gl.getUniformLocation(program, 'u_image0')
  const u_image1Location = gl.getUniformLocation(program, 'u_image1')

  // set which texture units to render with.
  gl.uniform1i(u_image0Location, 0) // texture unit 0
  gl.uniform1i(u_image1Location, 1) // texture unit 1

  // Set each texture unit to use a particular texture.
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, textures[0])
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, textures[1])

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
    t,
    canvasWidth,
    canvasHeight,
    normalisedMouseX,
    normalisedMouseY,
    scrollPos
  }: {
    t: number
    canvasWidth: number
    canvasHeight: number
    normalisedMouseX: number
    normalisedMouseY: number
    scrollPos: number
  },
  {
    program,
    bufferSetups,
    timeLocation,
    resolutionUniformLocation,
    mousePosLocation,
    scrollUniformLocation
  }: Awaited<ReturnType<typeof buildProgram>>
) => {
  gl.useProgram(program)
  bufferSetups.forEach((b) => b())

  gl.uniform1f(timeLocation, t)
  gl.uniform2fv(resolutionUniformLocation, [canvasWidth, canvasHeight])
  gl.uniform2fv(mousePosLocation, [normalisedMouseX, normalisedMouseY])
  gl.uniform1f(scrollUniformLocation, scrollPos)

  gl.drawArrays(gl.TRIANGLES, 0, 6)
}
