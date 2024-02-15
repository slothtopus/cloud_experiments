<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

import ShaderTemplate from '../common/ShaderTemplate.vue'
import { CONTROL_DEFAULTS } from '../common/shaderControls.types'
import type { ShaderControls } from '../common/shaderControls.types'

import { createDeferredPromise } from '@/lib/utils'
import { buildProgram, draw } from './cloudy_font_program'

import VERTEX_SHADER from '../common/vertex_quad.glsl2'
import FRAGMENT_SHADER from './fragment_cloudy_font.glsl2'

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

  let vanish = { t: 0 }
  let vanished = false
  window.addEventListener('click', () => {
    if (vanished) {
      vanished = false
      gsap.to(vanish, { t: 0, duration: 1.5, ease: 'power1.out' })
    } else {
      vanished = true
      gsap.to(vanish, { t: 1, duration: 1.5, ease: 'power1.in' })
    }
  })

  const animate = (delta: number) => {
    const t = delta / 10000

    const {
      canvasWidth,
      canvasHeight,
      draggedMouseX,
      draggedMouseY,
      stepSize,
      depthSteps,
      normalisedMouseX,
      normalisedMouseY
    } = controls.value
    draw(
      gl,
      {
        t,
        stepSize: stepSize / 100,
        depthSteps,
        normalisedMouseX,
        normalisedMouseY,
        canvasWidth,
        canvasHeight,
        draggedMouseX,
        draggedMouseY,
        vanish: vanish.t
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
  <ShaderTemplate
    @update:controls="controls = $event"
    @webglReady="webGLPromise.resolve($event)"
    :initialControls="{ quality: 50, stepSize: 5, depthSteps: 15 }"
  />
</template>

<style scoped></style>
