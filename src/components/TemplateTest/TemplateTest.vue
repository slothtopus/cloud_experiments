<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

import ShaderTemplate from '../common/ShaderTemplate.vue'
import { CONTROL_DEFAULTS } from '../common/shaderControls.types'
import type { ShaderControls } from '../common/shaderControls.types'

import { createDeferredPromise } from '@/lib/utils'
import { buildProgram, draw } from './test_program'

import VERTEX_SHADER from '../common/vertex_quad.glsl2'
import FRAGMENT_SHADER from './fragment_test.glsl2'

const controls = ref<ShaderControls>(CONTROL_DEFAULTS)
const webGLPromise = createDeferredPromise<WebGL2RenderingContext | WebGLRenderingContext>()

let animationId = 0

onMounted(async () => {
  const gl = await webGLPromise
  if (!(gl instanceof WebGL2RenderingContext)) {
    return
  }
  const cubeProgramParams = await buildProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER)

  // ----------------------- ANIMATE -----------------------

  const animate = (delta: number) => {
    //const t = delta / 10000

    const { canvasWidth, canvasHeight, normalisedMouseX, normalisedMouseY } = controls.value
    draw(
      gl,
      {
        canvasWidth,
        canvasHeight,
        normalisedMouseX,
        normalisedMouseY
      },
      cubeProgramParams
    )
    animationId = requestAnimationFrame(animate)
  }
  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.cancelAnimationFrame(animationId)
})
</script>

<template>
  <ShaderTemplate @update:controls="controls = $event" @webglReady="webGLPromise.resolve($event)" />
</template>

<style scoped></style>
