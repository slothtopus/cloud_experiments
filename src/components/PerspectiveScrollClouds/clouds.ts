import { createProgram, createShader } from '../../lib/webgl'
import {
  createFrustrumProjectionMatrix,
  matrixToColumnMajorArray,
  createTranslationMatrix4,
  multiplyMatrix4
} from '../../lib/lib'

import VERTEX_SHADER_CLOUDS from './vertex_clouds.glsl'
import FRAGMENT_SHADER_CLOUDS from './fragment_clouds.glsl'

import VERTEX_SHADER_SKY from './vertex_sky.glsl'
import FRAGMENT_SHADER_SKY from './fragment_sky.glsl'

export const buildXStarts = (width: number, n: number, xRange: [number, number]) => {
  const d = xRange[1] - xRange[0]
  const totalGap = d - n * width

  const r = [...Array(n + 1).keys()].map(() => Math.random())
  const rSum = r.reduce((s, x) => s + x, 0)
  const gaps = r.map((x) => (x / rSum) * totalGap)

  let xStart = xRange[0] + gaps[0]
  const xStarts = []
  for (let i = 1; i < n + 1; i++) {
    xStarts.push(xStart)
    xStart += width + gaps[i]
  }

  return xStarts
}

export const buildCloudRow = (
  yTopLeft: number,
  z: number,
  rectWidth: number,
  rectHeight: number,
  xRange: [number, number],
  nClouds: number
) => {
  const offsets = [
    // top triangle
    [0, 0, z],
    [rectWidth, 0, z],
    [0, -rectHeight, z],
    // bottom triangle
    [0, -rectHeight, z],
    [rectWidth, -rectHeight, z],
    [rectWidth, 0, z]
  ]

  const xStarts = buildXStarts(rectWidth, nClouds, xRange)

  const aOffsets = [...Array(nClouds).keys()].map(() => offsets.flatMap((x) => x)).flatMap((x) => x)
  const aTopLeft = xStarts
    .flatMap((x) => [x, x, x, x, x, x])
    .map((xStart) => [xStart, yTopLeft])
    .flatMap((x) => x)

  return { aOffsets, aTopLeft, d: xRange[1] - xRange[0], rectWidth, rectHeight }
}

export const buildCloudProgram = (gl: WebGLRenderingContext) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_CLOUDS)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_CLOUDS)
  const program = createProgram(gl, vertexShader, fragmentShader)

  // ----------------------- VERTICES -----------------------

  const rectHeight = 0.9
  const rectWidth = 2.18
  const xRange: [number, number] = [-9, 9]
  const d = xRange[1] - xRange[0]

  const aOffsets: number[] = []
  const aTopLeft: number[] = []

  // [yTopLeft, z, nCloud]
  const cloudRows = [
    /*[2, -1, 3],
    [1, -1, 3],*/
    //[2, -3, 12],
    //[1.5, -3, 12],
    [1, -2.3, 9],
    //[0.5, -2.2, 12],
    [0, -2.5, 9],
    //[-0.5, -3, 12],
    [-1, -2, 9],
    //[-1.5, -3, 12],
    [-2, -2.3, 9],
    //[2, -2, 12],
    //[1.5, -2, 12],
    [1, -1.9, 9],
    //[0.5, -2, 12],
    [0, -1.3, 9],
    //[-0.5, -2, 12],
    [-1, -1.2, 9],
    //[-1.5, -2, 12],
    [-2, -1.5, 9],
    //[2, -1, 12],
    //[1.5, -1, 12],
    [1, -1, 9],
    //[0.5, -1, 12],
    [0.24, -1, 9],
    //[-0.5, -1, 12],
    [-1, -1, 9],
    //[-1.5, -1, 12],
    [-2, -1, 9]

    /*[-1, -1, 3],
    [-2, -1, 3]*/
  ]

  for (const [yTopLeft, z, nCloud] of cloudRows) {
    const { aOffsets: aOffsetsNew, aTopLeft: aTopLeftNew } = buildCloudRow(
      yTopLeft,
      z,
      rectWidth,
      rectHeight,
      xRange,
      nCloud
    )
    aOffsets.push(...aOffsetsNew)
    aTopLeft.push(...aTopLeftNew)
  }

  console.log(aOffsets)
  console.log(aTopLeft)

  const bufferSetups: (() => void)[] = []

  const offsetBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(aOffsets), gl.STATIC_DRAW)
  const offsetAttributeLocation = gl.getAttribLocation(program, 'a_offsets')

  const offsetSetup = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer)
    gl.enableVertexAttribArray(offsetAttributeLocation)
    gl.vertexAttribPointer(offsetAttributeLocation, 3, gl.FLOAT, false, 0, 0)
  }
  bufferSetups.push(offsetSetup)

  const topleftBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, topleftBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(aTopLeft), gl.STATIC_DRAW)
  const topleftAttributeLocation = gl.getAttribLocation(program, 'a_topleft')

  const topleftSetup = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, topleftBuffer)
    gl.enableVertexAttribArray(topleftAttributeLocation)
    gl.vertexAttribPointer(topleftAttributeLocation, 2, gl.FLOAT, false, 0, 0)
  }
  bufferSetups.push(topleftSetup)

  gl.useProgram(program)

  // ----------------------- UNIFORMS -----------------------
  // constant uniforms:
  const rectResolutionUniformLocation = gl.getUniformLocation(program, 'u_rect_resolution')
  //if (rectResolutionUniformLocation === null) throw 'rectResolutionUniformLocation is null'
  gl.uniform2f(rectResolutionUniformLocation, rectWidth, rectHeight)

  const dUniformLocation = gl.getUniformLocation(program, 'u_d')
  if (dUniformLocation === null) throw 'dUniformLocation is null'
  gl.uniform1f(dUniformLocation, d)

  const zDepthUniformLocation = gl.getUniformLocation(program, 'u_zdepth')
  //if (zDepthUniformLocation === null) throw 'zDepthUniformLocation is null'
  gl.uniform1f(zDepthUniformLocation, 2)

  // non-constant uniforms
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_screen_resolution')
  //if (resolutionUniformLocation === null) throw 'resolutionUniformLocation is null'

  const timeUniform = gl.getUniformLocation(program, 'u_time')
  if (timeUniform === null) throw 'timeUniform is null'

  const projectionUniformLocation = gl.getUniformLocation(program, 'u_projection')
  //if (projectionUniformLocation === null) throw 'projectionUniformLocation is null'

  const scrollUniformLocation = gl.getUniformLocation(program, 'u_scroll_pct')

  //const mouseUniformLocation = gl.getUniformLocation(program, 'u_mouse')
  //if (mouseUniformLocation === null) throw 'mouseUniformLocation is null'

  // ----------------------- TEXTURE -----------------------

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    128,
    128,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([...Array(128 * 128 * 4).keys()].map((x) => Math.floor(Math.random() * 255)))
  )

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  return {
    program,
    timeUniform,
    //mouseUniformLocation,
    resolutionUniformLocation,
    projectionUniformLocation,
    scrollUniformLocation,
    bufferSetups,
    arrayLength: aOffsets.length / 3
  }
}

export const drawClouds = (
  gl: WebGLRenderingContext,
  {
    t,
    //normalisedMouseX,
    //normalisedMouseY,
    canvasWidth,
    canvasHeight,
    scrollPct
  }: {
    t: number
    normalisedMouseX: number
    normalisedMouseY: number
    canvasWidth: number
    canvasHeight: number
    scrollPct: number
  },
  {
    program,
    bufferSetups,
    timeUniform,
    //mouseUniformLocation,
    resolutionUniformLocation,
    projectionUniformLocation,
    scrollUniformLocation,
    arrayLength
  }: ReturnType<typeof buildCloudProgram>
) => {
  gl.useProgram(program)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  //vec4(0.05, 0.33, 0.71, 1);
  //gl.clearColor(0.05, 0.33, 0.71, 1)
  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.uniform2f(resolutionUniformLocation, canvasWidth, canvasHeight)
  gl.uniform1f(timeUniform, t)
  //gl.uniform2fv(mouseUniformLocation, [normalisedMouseX, normalisedMouseY])

  const pm = createFrustrumProjectionMatrix(-1.25, 1.25, -1.25, 1.25, 0.9999999, 10)
  const tm = createTranslationMatrix4(0, -1 + scrollPct * 4, 0)
  const finalMatrix = multiplyMatrix4(pm, tm)
  gl.uniformMatrix4fv(projectionUniformLocation, false, matrixToColumnMajorArray(finalMatrix))
  gl.uniform1f(scrollUniformLocation, scrollPct)

  bufferSetups.forEach((b) => b())
  gl.drawArrays(gl.TRIANGLES, 0, arrayLength)
}

export const buildSkyProgram = (gl: WebGLRenderingContext) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SKY)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SKY)

  const program = createProgram(gl, vertexShader, fragmentShader)

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

  return { program, bufferSetups, scrollUniformLocation }
}

export const drawSky = (
  gl: WebGLRenderingContext,
  {
    scrollPct
  }: {
    scrollPct: number
  },
  { program, bufferSetups, scrollUniformLocation }: ReturnType<typeof buildSkyProgram>
) => {
  gl.useProgram(program)
  bufferSetups.forEach((b) => b())
  gl.uniform1f(scrollUniformLocation, scrollPct)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}
