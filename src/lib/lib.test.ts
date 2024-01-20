import { expect, expectTypeOf, test } from 'vitest'

import {
  multiplyMatrix4,
  multiplyMatrix4Point4,
  createTranslationMatrix4,
  createFrustrumProjectionMatrix,
  normalisePoint4,
  CUBE_LINES
} from './lib'
import type { Matrix4, Point4 } from './lib'

test('multiplyMatrix4', () => {
  const m: Matrix4 = [
    [5, 7, 9, 10],
    [2, 3, 3, 8],
    [8, 10, 2, 3],
    [3, 3, 4, 8]
  ]
  const n: Matrix4 = [
    [3, 10, 12, 18],
    [12, 1, 4, 9],
    [9, 10, 12, 2],
    [3, 12, 4, 10]
  ]
  const res: Matrix4 = [
    [210, 267, 236, 271],
    [93, 149, 104, 149],
    [171, 146, 172, 268],
    [105, 169, 128, 169]
  ]

  expect(multiplyMatrix4(m, n)).toEqual(res)
})

test('multiplyMatrix4Point4', () => {
  const m: Matrix4 = [
    [3, 5, 2, 4],
    [5, 32, 12, 2],
    [64, 95, 2, 3],
    [12, 3, 45, 5]
  ]
  const p: Point4 = [7, 7, 8, 9]
  const r: Point4 = [108, 373, 1156, 510]

  expect(multiplyMatrix4Point4(m, p)).toEqual(r)
})

test('createTranslationMatrix4', () => {
  const tm = createTranslationMatrix4(10, 20, 30)
  const p: Point4 = [0, 0, 0, 1]
  const res: Point4 = [10, 20, 30, 1]

  expect(multiplyMatrix4Point4(tm, p)).toEqual(res)
})

test('perspective project points 1', () => {
  const pm = createFrustrumProjectionMatrix(-1, 1, -1, 1, 1, 2)

  // p1 is on near clipping plane
  const p1: Point4 = [0.5, 0.5, -1, 1]
  // p2 is on far clipping plane
  const p2: Point4 = [0.5, 0.5, -2, 1]

  // near clipping plane maps to z = -1
  expect(normalisePoint4(multiplyMatrix4Point4(pm, p1))).toEqual([0.5, 0.5, -1, 1])
  // far clipping plane maps to z = 1
  expect(normalisePoint4(multiplyMatrix4Point4(pm, p2))).toEqual([0.25, 0.25, 1, 1])
})

test('perspective project points 2', () => {
  const pm = createFrustrumProjectionMatrix(-5, 5, -10, 10, 1, 5)

  // p1 is on near clipping plane
  const p1: Point4 = [2, 2, -1, 1]
  // p2 is in between clipping planes
  const p2: Point4 = [2, 2, -2, 1]

  // near clipping plane maps to z = -1
  expect(normalisePoint4(multiplyMatrix4Point4(pm, p1))).toEqual([2 / 10, 2 / 5, -1, 1])
  // remapping of the z coordinate is non linear, which is why -2 maps to 1/4 here
  // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/opengl-perspective-projection-matrix.html#:~:text=Figure%203%3A,and%20far%20%3D%205.
  expect(normalisePoint4(multiplyMatrix4Point4(pm, p2))).toEqual([1 / 10, 1 / 5, 1 / 4, 1])
})

test('perspective project points 3', () => {
  const p1: Point4 = [0, 0, -3, 1]
  const pm = createFrustrumProjectionMatrix(-1, 1, -1, 1, 0.9999999, 3)
  console.log(normalisePoint4(multiplyMatrix4Point4(pm, p1)))
})
