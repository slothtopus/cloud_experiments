import RotatingCube from '@/components/RotatingCube/RotatingCube.vue'
import WebGLFirstExample from '@/components/WebGLFirstExample/WebGLFirstExample.vue'
import WebGLCircle from '@/components/WebGLCircle/WebGLCircle.vue'
import WebGLSquare from '@/components/WebGLSquare/WebGLSquare.vue'
import WebGLCube from '@/components/WebGLCube/WebGLCube.vue'
import WebGLRotatingCube from '@/components/WebGLRotatingCube/WebGLRotatingCube.vue'
import WebGLRotatingCubeFilled from '@/components/WebGLRotatingCube/WebGLRotatingCubeFilled.vue'

import HomePage from '@/components/HomePage.vue'

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: HomePage },
  { path: '/rotating-cube', component: RotatingCube },
  { path: '/web-gl-first-example', component: WebGLFirstExample },
  { path: '/web-gl-circle', component: WebGLCircle },
  { path: '/web-gl-square', component: WebGLSquare },
  { path: '/web-gl-cube', component: WebGLCube },
  { path: '/web-gl-rotating-cube', component: WebGLRotatingCube },
  { path: '/web-gl-rotating-cube-filled', component: WebGLRotatingCubeFilled }
]

export const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes
})
