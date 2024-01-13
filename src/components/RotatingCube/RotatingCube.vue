<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'

import { matrix } from 'mathjs'
import { create, all } from 'mathjs'

const config = {}
const math = create(all, config)

//debugger
const points = 8
const cubeSide = [...Array(points).keys()].map((i) => i / (points - 1))
//const cubeSide = [...Array(points).keys()].map(() => Math.random())
cubeSide.reverse()

const cube: [number, number, number][] = []
cubeSide.forEach((z) => {
  cubeSide.forEach((y) => {
    cubeSide.forEach((x) => {
      cube.push([x - 0.5, y - 0.5, z + 1])
    })
  })
})

const cameraPos = [0, 0, -1]
const screenPos = [0, 0, 0.5]

class TransformationMatrix3D {
  m = matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ])

  rotatex(theta: number) {
    const rotationM = matrix([
      [1, 0, 0, 0],
      [0, Math.cos(theta), Math.sin(theta), 0],
      [0, -Math.sin(theta), Math.cos(theta), 0],
      [0, 0, 0, 1]
    ])
    this.m = math.multiply(this.m, rotationM)
  }

  rotate(thetaX: number, thetaY: number, thetaZ: number) {
    let mNew = this.m
    if (thetaX != 0) {
      const rotationX = matrix([
        [1, 0, 0, 0],
        [0, Math.cos(thetaX), Math.sin(thetaX), 0],
        [0, -Math.sin(thetaX), Math.cos(thetaX), 0],
        [0, 0, 0, 1]
      ])
      mNew = math.multiply(this.m, rotationX)
    }

    if (thetaY != 0) {
      const rotationY = matrix([
        [Math.cos(thetaY), 0, -Math.sin(thetaY), 0],
        [0, 1, 0, 0],
        [Math.sin(thetaY), 0, Math.cos(thetaY), 0],
        [0, 0, 0, 1]
      ])
      mNew = math.multiply(mNew, rotationY)
    }

    if (thetaZ != 0) {
      const rotationZ = matrix([
        [Math.cos(thetaZ), Math.sin(thetaZ), 0, 0],
        [-Math.sin(thetaZ), Math.cos(thetaZ), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ])
      mNew = math.multiply(mNew, rotationZ)
    }
    this.m = mNew
  }

  translate(x: number, y: number, z: number) {
    const translationM = matrix([
      [1, 0, 0, x],
      [0, 1, 0, y],
      [0, 0, 1, z],
      [0, 0, 0, 1]
    ])
    this.m = math.multiply(this.m, translationM)
  }

  transformPoint(x: number, y: number, z: number) {
    const pt = math.multiply(this.m, [x, y, z, 1]).toArray()
    return [Number(pt[0]), Number(pt[1]), Number(pt[2])]
  }
}

const t = ref(0)
setInterval(() => {
  t.value += 0.001
  if (t.value > 1) {
    t.value = 0
  }
}, 50)

const projectedCube: ComputedRef<[number, number, number][]> = computed(() => {
  const tm = new TransformationMatrix3D()
  tm.translate(0, 0, 1.5)
  tm.rotate(2 * Math.PI * t.value, 6 * Math.PI * t.value, 4 * Math.PI * t.value)
  tm.translate(0, 0, -1.5)

  return cube.map(([ox, oy, oz]) => {
    const [x, y, z] = tm.transformPoint(ox, oy, oz)
    const zDivider = screenPos[2] - cameraPos[2]
    const px = x / z / zDivider
    const py = y / z / zDivider
    return [px, py, z]
  })
})
</script>

<template>
  <svg id="svg-element" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
    <circle
      v-for="([px, py, z], i) in projectedCube"
      :key="i"
      :cx="px * 500 + 500"
      :cy="py * 500 + 500"
      :fill="`rgb(${(2 - z) * 255}, ${(2 - z) * 255},${(2 - z) * 255})`"
      r="3"
    />
    <!--:fill="`rgb(${(2 - z) * 255}, ${(2 - z) * 255},${(2 - z) * 255})`"-->
    <!--<rect x="0" y="0" width="1000" height="1000" stroke="red" fill="none" />-->
  </svg>
</template>

<style scoped>
svg {
  background-color: black;
  display: block;
  width: 100%;
  height: 100%;
}

/*circle {
  fill: white;
}*/
</style>
