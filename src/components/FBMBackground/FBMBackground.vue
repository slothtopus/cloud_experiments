<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

import ShaderTemplate from '../common/ShaderTemplate.vue'
import { CONTROL_DEFAULTS } from '../common/shaderControls.types'
import type { ShaderControls } from '../common/shaderControls.types'

import { createDeferredPromise } from '@/lib/utils'
import { buildProgram, draw } from './fbm_background_program'

import VERTEX_SHADER from '../common/vertex_quad.glsl2'
import FRAGMENT_SHADER from './fragment_fbm_background.glsl2'

const controls = ref<ShaderControls>(CONTROL_DEFAULTS)
const webGLPromise = createDeferredPromise<WebGL2RenderingContext | WebGLRenderingContext>()

let animationId = 0

onMounted(async () => {
  const gl = await webGLPromise
  if (!(gl instanceof WebGL2RenderingContext)) {
    return
  }
  const programParams = await buildProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER)

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

    const { canvasWidth, canvasHeight, normalisedMouseX, normalisedMouseY, scrollPos } =
      controls.value
    draw(
      gl,
      {
        t,
        normalisedMouseX,
        normalisedMouseY,
        canvasWidth,
        canvasHeight,
        scrollPos
      },
      programParams
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
  >
    <div class="content">
      <div class="textbox top">
        <h1>start</h1>
      </div>
      <div class="textbox bottom">
        <h1>end</h1>
      </div>
    </div>
  </ShaderTemplate>
</template>

<style scoped>
.content {
  height: 200%;
  position: relative;
}

.textbox {
  border-radius: 1rem;
  padding: 2rem 3rem;
  backdrop-filter: blur(10px);
  background-color: rgba(0, 0, 0, 0.2);
}

.top {
  position: absolute;
  top: 1rem;
  left: 1rem;
  /*transform: translateX(-50%);*/
}

.bottom {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  /*transform: translateX(-50%);*/
}

h1 {
  font-family: 'Comfortaa', sans-serif;
  margin: 0;
  color: white;
  font-size: 5rem;
}
</style>
