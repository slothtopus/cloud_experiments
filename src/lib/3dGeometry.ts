export type Matrix4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
]
export type Point4 = [number, number, number, number]

export const projection = (width: number, height: number, depth: number): Matrix4 => {
  // Note: This matrix flips the Y axis so 0 is at the top.
  return [2 / width, 0, 0, 0, 0, -2 / height, 0, 0, 0, 0, 2 / depth, 0, -1, 1, 0, 1]
}

export const multiply = (a: Matrix4, b: Matrix4): Matrix4 => {
  const a00 = a[0 * 4 + 0]
  const a01 = a[0 * 4 + 1]
  const a02 = a[0 * 4 + 2]
  const a03 = a[0 * 4 + 3]
  const a10 = a[1 * 4 + 0]
  const a11 = a[1 * 4 + 1]
  const a12 = a[1 * 4 + 2]
  const a13 = a[1 * 4 + 3]
  const a20 = a[2 * 4 + 0]
  const a21 = a[2 * 4 + 1]
  const a22 = a[2 * 4 + 2]
  const a23 = a[2 * 4 + 3]
  const a30 = a[3 * 4 + 0]
  const a31 = a[3 * 4 + 1]
  const a32 = a[3 * 4 + 2]
  const a33 = a[3 * 4 + 3]
  const b00 = b[0 * 4 + 0]
  const b01 = b[0 * 4 + 1]
  const b02 = b[0 * 4 + 2]
  const b03 = b[0 * 4 + 3]
  const b10 = b[1 * 4 + 0]
  const b11 = b[1 * 4 + 1]
  const b12 = b[1 * 4 + 2]
  const b13 = b[1 * 4 + 3]
  const b20 = b[2 * 4 + 0]
  const b21 = b[2 * 4 + 1]
  const b22 = b[2 * 4 + 2]
  const b23 = b[2 * 4 + 3]
  const b30 = b[3 * 4 + 0]
  const b31 = b[3 * 4 + 1]
  const b32 = b[3 * 4 + 2]
  const b33 = b[3 * 4 + 3]
  return [
    b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
    b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
    b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
    b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
    b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
    b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
    b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
    b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
    b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
    b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
    b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
    b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
    b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
    b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
    b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
    b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
  ]
}

export const transformPoint = (m: Matrix4, p: Point4) => {
  const a00 = m[0 * 4 + 0]
  const a01 = m[0 * 4 + 1]
  const a02 = m[0 * 4 + 2]
  const a03 = m[0 * 4 + 3]
  const a10 = m[1 * 4 + 0]
  const a11 = m[1 * 4 + 1]
  const a12 = m[1 * 4 + 2]
  const a13 = m[1 * 4 + 3]
  const a20 = m[2 * 4 + 0]
  const a21 = m[2 * 4 + 1]
  const a22 = m[2 * 4 + 2]
  const a23 = m[2 * 4 + 3]
  const a30 = m[3 * 4 + 0]
  const a31 = m[3 * 4 + 1]
  const a32 = m[3 * 4 + 2]
  const a33 = m[3 * 4 + 3]

  const x = p[0]
  const y = p[1]
  const z = p[2]
  const w = p[3]

  //debugger

  return [
    /*x * a00 + y * a01 + z * a02 + w * a03,
    x * a10 + y * a11 + z * a12 + w * a13,
    x * a20 + y * a21 + z * a22 + w * a23,
    x * a30 + y * a31 + z * a32 + w * a33*/
    x * a00 + y * a10 + z * a20 + w * a30,
    x * a01 + y * a11 + z * a21 + w * a31,
    x * a02 + y * a12 + z * a22 + w * a32,
    x * a03 + y * a13 + z * a23 + w * a33
  ]
}

export const identity = (): Matrix4 => {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
}

export const translation = (tx: number, ty: number, tz: number): Matrix4 => {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1]
}

export const xRotation = (angleInRadians: number): Matrix4 => {
  const c = Math.cos(angleInRadians)
  const s = Math.sin(angleInRadians)

  return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]
}

export const yRotation = (angleInRadians: number): Matrix4 => {
  const c = Math.cos(angleInRadians)
  const s = Math.sin(angleInRadians)

  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]
}

export const zRotation = (angleInRadians: number): Matrix4 => {
  const c = Math.cos(angleInRadians)
  const s = Math.sin(angleInRadians)

  return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
}

export const scaling = (sx: number, sy: number, sz: number): Matrix4 => {
  return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1]
}

export const translate = (m: Matrix4, tx: number, ty: number, tz: number): Matrix4 => {
  return multiply(m, translation(tx, ty, tz))
}

export const xRotate = (m: Matrix4, angleInRadians: number): Matrix4 => {
  return multiply(m, xRotation(angleInRadians))
}

export const yRotate = (m: Matrix4, angleInRadians: number): Matrix4 => {
  return multiply(m, yRotation(angleInRadians))
}

export const zRotate = (m: Matrix4, angleInRadians: number) => {
  return multiply(m, zRotation(angleInRadians))
}

export const scale = (m: Matrix4, sx: number, sy: number, sz: number) => {
  return multiply(m, scaling(sx, sy, sz))
}

export const perspective = (
  fieldOfViewInRadians: number,
  aspect: number,
  near: number,
  far: number
): Matrix4 => {
  const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians)
  const rangeInv = 1.0 / (near - far)

  /* eslint-disable */
  // prettier-ignore
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0
  ]
  /* eslint-enable */
}
