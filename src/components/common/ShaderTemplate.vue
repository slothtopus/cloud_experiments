<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted, watch } from 'vue'
import { resizeCanvasToDisplaySize } from 'twgl.js'

import { CONTROL_DEFAULTS } from './shaderControls.types'
import type { ShaderControls } from './shaderControls.types'

interface Props {
  initialControls?: Partial<ShaderControls>
}
const props = defineProps<Props>()

const webGLVersion = ref('')
const fps = ref(0)

const getDefault = <T extends keyof ShaderControls>(controlKey: T): ShaderControls[T] => {
  if (props.initialControls !== undefined && props.initialControls[controlKey] !== undefined) {
    return props.initialControls[controlKey] as ShaderControls[T]
  } else {
    return CONTROL_DEFAULTS[controlKey]
  }
}

const quality = ref(getDefault('quality'))
const scrollPos = ref(getDefault('scrollPos'))
const stepSize = ref(getDefault('stepSize'))
const depthSteps = ref(getDefault('depthSteps'))
const normalisedMouseX = ref(getDefault('normalisedMouseX'))
const normalisedMouseY = ref(getDefault('normalisedMouseY'))
const draggedMouseX = ref(getDefault('draggedMouseX'))
const draggedMouseY = ref(getDefault('draggedMouseY'))
const mouseDown = ref(getDefault('mouseDown'))
const canvasWidth = ref(getDefault('canvasWidth'))
const canvasHeight = ref(getDefault('canvasHeight'))

const allControls = computed<ShaderControls>(() => {
  return {
    webGLVersion: webGLVersion.value,
    fps: fps.value,
    quality: quality.value,
    scrollPos: scrollPos.value,
    stepSize: stepSize.value,
    depthSteps: depthSteps.value,
    normalisedMouseX: normalisedMouseX.value,
    normalisedMouseY: normalisedMouseY.value,
    draggedMouseX: draggedMouseX.value,
    draggedMouseY: draggedMouseY.value,
    mouseDown: mouseDown.value,
    canvasWidth: canvasWidth.value,
    canvasHeight: canvasHeight.value
  } as ShaderControls
})

const emit = defineEmits<{
  'update:controls': [controls: ShaderControls]
  webglReady: [gl: WebGL2RenderingContext | WebGLRenderingContext]
}>()

watch(allControls, () => {
  emit('update:controls', allControls.value)
})

let lastMouseX: undefined | number = undefined
let lastMouseY: undefined | number = undefined

let animationId = 0

const normaliseScreenCoords = (x: number, y: number): [number, number] => [
  (x / window.innerWidth) * 2 - 1,
  -((y / window.innerHeight) * 2 - 1)
]
const handleMouseMove = (event: MouseEvent) => {
  const [normX, normY] = normaliseScreenCoords(event.clientX, event.clientY)
  normalisedMouseX.value = normX
  normalisedMouseY.value = normY
  if (mouseDown.value) {
    if (lastMouseX !== undefined && lastMouseY !== undefined) {
      const [lastNormX, lastNormY] = normaliseScreenCoords(lastMouseX, lastMouseY)
      draggedMouseX.value += normX - lastNormX
      draggedMouseY.value += normY - lastNormY
    }
  }
  lastMouseX = event.clientX
  lastMouseY = event.clientY
}

const handleMouseDown = () => {
  mouseDown.value = true
}

const handleMouseUp = () => {
  mouseDown.value = false
}

const handleScroll = () => {
  const visibleHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight
  if (visibleHeight != 0) {
    scrollPos.value = window.scrollY / visibleHeight
  } else {
    scrollPos.value = 0
  }
}
onMounted(async () => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('scroll', handleScroll)
  handleScroll()

  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (canvas === null) return

  resizeCanvasToDisplaySize(canvas)

  console.log('getting web gl in template')
  const gl = canvas.getContext('webgl2')
  if (gl === null) {
    console.error('Error getting WebGL context')
    return
  }
  console.log('got it!', gl)

  webGLVersion.value = gl.getParameter(gl.VERSION)
  emit('webglReady', gl)

  let frames = 0
  let framesStart = 0

  const animate = (delta: number) => {
    resizeCanvasToDisplaySize(canvas, quality.value / 100)
    gl.viewport(0, 0, canvas.width, canvas.height)
    canvasWidth.value = canvas.width
    canvasHeight.value = canvas.height
    animationId = requestAnimationFrame(animate)

    frames += 1
    if (frames == 100) {
      fps.value = 1000 / ((delta - framesStart) / 100)
      frames = 0
      framesStart = delta
    }
  }
  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.cancelAnimationFrame(animationId)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <canvas id="canvas"></canvas>
  <div class="controls">
    <p>{{ webGLVersion }}</p>
    <hr />
    <p>fps: {{ fps.toFixed(2) }}</p>
    <hr />
    <input type="range" min="1" max="200" v-model="quality" />
    <p>Quality: {{ (quality / 100).toFixed(2) }}</p>
    <hr />
    <input type="range" min="1" max="20" v-model="stepSize" />
    <p>Stepsize: {{ (stepSize / 100).toFixed(2) }}</p>
    <hr />
    <input type="range" min="1" max="500" v-model="depthSteps" />
    <p>Depth steps: {{ depthSteps }}</p>
    <hr />
    <p>Scroll: {{ (scrollPos * 100).toFixed(2) }}%</p>
    <p>Mouse: {{ normalisedMouseX.toFixed(2) }}, {{ normalisedMouseY.toFixed(2) }}</p>
    <p>Dragged: {{ draggedMouseX.toFixed(2) }}, {{ draggedMouseY.toFixed(2) }}</p>
  </div>
</template>

<style scoped>
canvas {
  position: fixed;
  inset: 0px;
  width: 100%;
  height: 100%;
  /*image-rendering: pixelated;
  image-rendering: crisp-edges;*/
}
.controls {
  position: fixed;
  top: 0.25rem;
  right: 0.25rem;
  color: white;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.75);
  padding: 6px;
  border-radius: 6px;
}

.controls input {
  width: 100%;
}

.controls p {
  margin: 0;
  text-align: center;
}
</style>
