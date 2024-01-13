export type MatrixArray = [number, number, number, number, number, number]
export type RectDimensions = {
  width: number
  height: number
  x: number
  y: number
}
export type Point = { x: number; y: number }

// taken from
// https://riptutorial.com/html5-canvas/example/19666/a-transformation-matrix-to-track-translated--rotated---scaled-shape-s-
export class TransformationMatrix {
  m: MatrixArray = [1, 0, 0, 1, 0, 0]
  metaData: { flipped?: boolean } = {}

  reset() {
    this.m = [1, 0, 0, 1, 0, 0]
  }

  multiply(mat: MatrixArray) {
    const m = this.m
    const m0 = m[0] * mat[0] + m[2] * mat[1]
    const m1 = m[1] * mat[0] + m[3] * mat[1]
    const m2 = m[0] * mat[2] + m[2] * mat[3]
    const m3 = m[1] * mat[2] + m[3] * mat[3]
    const m4 = m[0] * mat[4] + m[2] * mat[5] + m[4]
    const m5 = m[1] * mat[4] + m[3] * mat[5] + m[5]
    this.m = [m0, m1, m2, m3, m4, m5]
  }

  // shared methods
  translate(x: number, y: number) {
    const mat: MatrixArray = [1, 0, 0, 1, x, y]
    this.multiply(mat)
  }

  rotate(rAngle: number) {
    const c = Math.cos(rAngle)
    const s = Math.sin(rAngle)
    const mat: MatrixArray = [c, s, -s, c, 0, 0]
    this.multiply(mat)
  }

  scale(x: number, y: number) {
    const mat: MatrixArray = [x, 0, 0, y, 0, 0]
    this.multiply(mat)
  }

  skew(radianX: number, radianY: number) {
    const mat: MatrixArray = [1, Math.tan(radianY), Math.tan(radianX), 1, 0, 0]
    this.multiply(mat)
  }

  getTransformedPoint(screenX: number, screenY: number) {
    const m = this.m
    return {
      x: screenX * m[0] + screenY * m[2] + m[4],
      y: screenX * m[1] + screenY * m[3] + m[5]
    }
  }
  getScreenPoint(transformedX: number, transformedY: number) {
    const im = this.getInvertedMatrix()
    return {
      x: transformedX * im[0] + transformedY * im[2] + im[4],
      y: transformedX * im[1] + transformedY * im[3] + im[5]
    }
  }

  getInvertedMatrix() {
    const m = this.m
    const d = 1 / (m[0] * m[3] - m[1] * m[2])
    const im = [
      m[3] * d,
      -m[1] * d,
      -m[2] * d,
      m[0] * d,
      d * (m[2] * m[5] - m[3] * m[4]),
      d * (m[1] * m[4] - m[0] * m[5])
    ]

    return im
  }

  getMatrix(): MatrixArray {
    const m = this.m
    return [...m]
  }

  getMatrixString() {
    const m = this.m
    return `matrix(${m[0]} ${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]})`
  }
}

export const calculateRectOverlap = (
  containerRect: RectDimensions,
  elementRect: RectDimensions
) => {
  // adapted from
  // https://stackoverflow.com/questions/9324339/how-much-do-two-rectangles-overlap

  const XA2 = containerRect.x + containerRect.width
  const XB2 = elementRect.x + elementRect.width
  const XA1 = containerRect.x
  const XB1 = elementRect.x
  const YA2 = containerRect.y + containerRect.height
  const YB2 = elementRect.y + elementRect.height
  const YA1 = containerRect.y
  const YB1 = elementRect.y

  const intersectionArea =
    Math.max(0, Math.min(XA2, XB2) - Math.max(XA1, XB1)) *
    Math.max(0, Math.min(YA2, YB2) - Math.max(YA1, YB1))
  const elementArea = elementRect.width * elementRect.height

  return intersectionArea == 0 ? 0 : intersectionArea / elementArea
}
