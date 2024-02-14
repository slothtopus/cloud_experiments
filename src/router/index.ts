import RotatingCube from '@/components/RotatingCube/RotatingCube.vue'
import WebGLFirstExample from '@/components/WebGLFirstExample/WebGLFirstExample.vue'
import WebGLCircle from '@/components/WebGLCircle/WebGLCircle.vue'
import WebGLSquare from '@/components/WebGLSquare/WebGLSquare.vue'
import WebGLCube from '@/components/WebGLCube/WebGLCube.vue'
import WebGLRotatingCube from '@/components/WebGLRotatingCube/WebGLRotatingCube.vue'
import WebGLRotatingCubeFilled from '@/components/WebGLRotatingCube/WebGLRotatingCubeFilled.vue'
import RayMarchedSphere from '@/components/RayMarchedSphere/RayMarchedSphere.vue'
import SingleAlgoCloud from '@/components/AlgoClouds/SingleAlgoCloud.vue'
import RayMarchedCloud from '@/components/RayMarchedCloud/RayMarchedCloud.vue'
import SideScrolling from '@/components/SideScrolling/SideScrolling.vue'
import SideScrollingFrag from '@/components/SideScrollingFrag/SideScrollingFrag.vue'
import SideScrollingComponent from '@/components/SideScrollingComponent/SideScrollingComponent.vue'
import SideScrollingComponent2 from '@/components/SideScrollingComponent2/SideScrollingComponent2.vue'
import LayeredClouds from '@/components/LayeredClouds/LayeredClouds.vue'
import PerspectiveScroll from '@/components/PerspectiveScroll/PerspectiveScroll.vue'
import PerspectiveScrollClouds from '@/components/PerspectiveScrollClouds/PerspectiveScrollClouds.vue'
import BeersLawCube from '@/components/BeersLawCube/BeersLawCube.vue'
import PerlinNoise from '@/components/PerlinNoise/PerlinNoise.vue'
import PerlinNoiseFromTexture from '@/components/PerlinNoise/PerlinNoiseFromTexture.vue'
import PerlinBeersCube from '@/components/BeersLawCube/PerlinBeersCube.vue'
import LitPerlinBeerCube from '@/components/BeersLawCube/LitPerlinBeerCube.vue'
import LitPerlinBeerCube2 from '@/components/BeersLawCube/LitPerlinBeerCube2.vue'
import CarvedCube from '@/components/CarvedCube/CarvedCube.vue'
import BeersCarvedCube from '@/components/CarvedCube/BeersCarvedCube.vue'
import LitBeersCarvedCube from '@/components/CarvedCube/LitBeersCarvedCube.vue'

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
  { path: '/web-gl-rotating-cube-filled', component: WebGLRotatingCubeFilled },
  { path: '/ray-marched-sphere', component: RayMarchedSphere },
  { path: '/algocloud', component: SingleAlgoCloud },
  { path: '/ray-marched-cloud', component: RayMarchedCloud },
  { path: '/sidescrolling', component: SideScrolling },
  { path: '/sidescrolling2', component: SideScrollingFrag },
  { path: '/sidescrolling3', component: SideScrollingComponent },
  { path: '/sidescrolling4', component: SideScrollingComponent2 },
  { path: '/layered-clouds', component: LayeredClouds },
  { path: '/perspective-scroll', component: PerspectiveScroll },
  { path: '/perspective-clouds', component: PerspectiveScrollClouds },
  { path: '/beers-law-cube', component: BeersLawCube },
  { path: '/perlin-noise', component: PerlinNoise },
  { path: '/perlin-noise-texture', component: PerlinNoiseFromTexture },
  { path: '/perlin-beers-cube', component: PerlinBeersCube },
  { path: '/lit-perlin-beer-cube', component: LitPerlinBeerCube },
  { path: '/lit-perlin-beer-cube2', component: LitPerlinBeerCube2 },
  { path: '/carved-cube', component: CarvedCube },
  { path: '/beers-carved-cube', component: BeersCarvedCube },
  { path: '/lit-beers-carved-cube', component: LitBeersCarvedCube }
  //{ path: '/', component: LayeredClouds }
]

export const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes
})
