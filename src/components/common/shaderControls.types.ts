export type ShaderControls = {
  quality: number
  scrollPos: number
  stepSize: number
  depthSteps: number
  normalisedMouseX: number
  normalisedMouseY: number
  draggedMouseX: number
  draggedMouseY: number
  mouseDown: boolean
  canvasWidth: number
  canvasHeight: number
}

export const CONTROL_DEFAULTS = {
  quality: 25,
  scrollPos: 0,
  stepSize: 10,
  depthSteps: 50,
  normalisedMouseX: 0,
  normalisedMouseY: 0,
  draggedMouseX: 0,
  draggedMouseY: 0,
  mouseDown: false,
  canvasWidth: 1,
  canvasHeight: 1
}
/*const webGLVersion = ref('')
const fps = ref(0)

const quality = ref(25)
const scrollPos = ref(0)
const stepSize = ref(10)
const depthSteps = ref(50)

const normalisedMouseX = ref(0)
const normalisedMouseY = ref(0)
const draggedMouseX = ref(0)
const draggedMouseY = ref(0)
const mouseDown = ref(false)*/
