export const CUBE_LINES = [
  // front face
  [-0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [-0.5, -0.5, 0.5],
  [-0.5, -0.5, 0.5],
  [-0.5, 0.5, 0.5],
  // back face
  [-0.5, 0.5, -0.5],
  [0.5, 0.5, -0.5],
  [0.5, 0.5, -0.5],
  [0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [-0.5, -0.5, -0.5],
  [-0.5, -0.5, -0.5],
  [-0.5, 0.5, -0.5],
  // connectors
  [-0.5, 0.5, 0.5],
  [-0.5, 0.5, -0.5],
  [0.5, 0.5, 0.5],
  [0.5, 0.5, -0.5],
  [0.5, -0.5, 0.5],
  [0.5, -0.5, -0.5],
  [-0.5, -0.5, 0.5],
  [-0.5, -0.5, -0.5]
]

export type Point4 = [number, number, number, number]
// [rows, columns]
export type Matrix4 = [Point4, Point4, Point4, Point4]

export const createEmptyMatrix = (): Matrix4 => {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
}

export const createIdentityMatrix = (): Matrix4 => {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]
}

export const multiplyMatrix4 = (m: Matrix4, n: Matrix4) => {
  const r = createEmptyMatrix()
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      r[row][col] =
        m[row][0] * n[0][col] +
        m[row][1] * n[1][col] +
        m[row][2] * n[2][col] +
        m[row][3] * n[3][col]
    }
  }
  return r
}

export const multiplyMatrix4Point4 = (m: Matrix4, p: Point4) => {
  const r: Point4 = [0, 0, 0, 0]
  for (let row = 0; row < 4; row++) {
    r[row] = m[row][0] * p[0] + m[row][1] * p[1] + m[row][2] * p[2] + m[row][3] * p[3]
  }
  return r
}

export const createTranslationMatrix4 = (x: number, y: number, z: number) => {
  const m = createIdentityMatrix()
  m[0][3] = x
  m[1][3] = y
  m[2][3] = z
  return m
}

export const normalisePoint4 = (p: Point4): Point4 => {
  return [p[0] / p[3], p[1] / p[3], p[2] / p[3], p[3] / p[3]]
}

export const matrixToRowMajorArray = (m: Matrix4) => {
  return m.flatMap((x) => x)
}

export const matrixToColumnMajorArray = (m: Matrix4) => {
  const res: number[] = []
  for (let col = 0; col < m[0].length; col++) {
    for (let row = 0; row < m.length; row++) {
      res.push(m[row][col])
    }
  }
  return res
}

/* set OpenGL perspective projection matrix
  https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/opengl-perspective-projection-matrix.html
  
  converts the frustrum defined by the screen coordinates and the near and far clipping planes
  to a cube with sides [-1,1]

  camera is at [0,0,0]
  image plane is located on the near clipping plane, centred at 0,0,0 and defined by the screen coordinates

  z coords at the near clipping plane are mapped to -1
  z coords at the far clipping plane are mapped to 1
  (this seems the wrong way round, but in practice doesn't matter because it does not
  change the orthographic projection)
  */
export const createFrustrumProjectionMatrix = (
  screenBottom: number,
  screenTop: number,
  screenLeft: number,
  screenRight: number,

  // near and far clips are negated in the formula so we pass them as positive values
  nearClip: number,
  farClip: number
): Matrix4 => {
  const m = createEmptyMatrix()

  m[0][0] = (2 * nearClip) / (screenRight - screenLeft)
  m[0][1] = 0
  m[0][2] = (screenRight + screenLeft) / (screenRight - screenLeft)
  m[0][3] = 0

  m[1][0] = 0
  m[1][1] = (2 * nearClip) / (screenTop - screenBottom)
  m[1][2] = (screenTop + screenBottom) / (screenTop - screenBottom)
  m[1][3] = 0

  m[2][0] = 0
  m[2][1] = 0
  m[2][2] = -(farClip + nearClip) / (farClip - nearClip)
  m[2][3] = (-2 * farClip * nearClip) / (farClip - nearClip)

  m[3][0] = 0
  m[3][1] = 0
  m[3][2] = -1
  m[3][3] = 0

  return m
}
