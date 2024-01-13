import { Matrix4, Vector3 } from '@math.gl/core'

const i = new Matrix4().identity()
i.translate([0, 0, 10])

const v = new Vector3(1, 1, 1)
console.log(v)
console.log(i.transformAsPoint(v))

const fr = new Matrix4().frustum({ left: 0, right: 100, bottom: 0, top: 100, near: 1, far: 1000 })

console.log(fr.transformAsPoint([50, 50, -2]))
