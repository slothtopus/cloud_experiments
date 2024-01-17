<script setup lang="ts">
import { onMounted } from 'vue'

import { resizeCanvasToDisplaySize } from 'twgl.js'
import { createProgram, createShader } from '@/lib/webgl'

import { createRotationMatrix4, matrixToColumnMajorArray } from './lib'

const VERTEX_SHADER = `
  // an attribute will receive data from a buffer
  attribute vec2 a_position;

  uniform vec2 u_resolution;

  varying vec2 v_position;

  void main() {
    vec2 aspectDivide;
    if(u_resolution.x > u_resolution.y) {
      aspectDivide = vec2(u_resolution.x / u_resolution.y, 1);
    } else {
      aspectDivide = vec2(1, u_resolution.y / u_resolution.x);
    }

    gl_Position = vec4(a_position.xy, 0, 1);

    v_position = a_position * aspectDivide;
  }
`

const FRAGMENT_SHADER = `
  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
  precision mediump float;

  #define MAX_STEPS 100
  #define MAX_DIST 100.
  #define SURF_DIST .01

  varying vec2 v_position;

  uniform mat4 u_light1_transform;
  uniform mat4 u_light2_transform;
  uniform mat4 u_light3_transform;

  float GetDist(vec3 p) {
	  /*vec4 s1 = vec4(0, 0, 0, 1.5);
    vec4 s2 = vec4(-1.25, 0, 0, 1.6);
    vec4 s3 = vec4(1.25, 0, 0, 1.6);
    float sphere1Dist = length(p-s1.xyz)-s1.w;
    float sphere2Dist = length(p-s2.xyz)-s2.w;
    float sphere3Dist = length(p-s3.xyz)-s3.w;
    return min(min(sphere1Dist, sphere2Dist), sphere3Dist);*/

    vec4 s1 = vec4(0, 0, 0, 1.5);
    float sphere1Dist = length(p-s1.xyz)-s1.w;
    return sphere1Dist + sin(normalize(p).x * 10.) / 20. + cos(normalize(p).y * 20.) / 50. + cos(normalize(p).z * 30.) / 40.;
  }

  float RayMarch(vec3 ro, vec3 rd) {
    float dO=0.;
      for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd*dO;
          float dS = GetDist(p);
          dO += dS;
          if(dO>MAX_DIST || dS<SURF_DIST) break;
      }
      return dO;
  }


  vec3 GetNormal(vec3 p) {
    float d = GetDist(p);
      vec2 e = vec2(.01, 0);
      
      vec3 n = d - vec3(
          GetDist(p-e.xyy),
          GetDist(p-e.yxy),
          GetDist(p-e.yyx));
      
      return normalize(n);
  }

  float GetLight(vec3 p, vec3 lightPos) {
      vec3 l = normalize(lightPos-p);
      vec3 n = GetNormal(p);
      
      float dif = clamp(dot(n, l), 0., 1.);
      return dif;
  }


  void main() {

    vec3 col = vec3((v_position.xy + 1.) / 2., 1.);

    vec3 ro = vec3(0, 0, -3);
    vec3 rd = normalize(vec3(v_position.x, v_position.y, 1));

    float d = RayMarch(ro, rd);
    //d = d / 4.;

    if(d < 100.) {
      vec3 p = ro + rd * d;
      vec4 light1 = u_light1_transform * vec4(0, 100, 0, 1);
      vec3 light1Dif = GetLight(p, light1.xyz) * vec3(1, 0, 0);

      vec4 light2 = u_light2_transform * vec4(100, 0, 0, 1);
      vec3 light2Dif = GetLight(p, light2.xyz) * vec3(0, 1, 0);

      vec4 light3 = u_light3_transform * vec4(10, 0, -5, 1);
      vec3 light3Dif = GetLight(p, light3.xyz) * vec3(0, 0, 1);

      gl_FragColor = vec4(light1Dif + light2Dif + light3Dif, 1.0);
    } else {
      gl_FragColor = vec4(col, 1.);
    }

    /*float r = v_position.x*v_position.x + v_position.y*v_position.y;

    if(r <= 1.0) {
      gl_FragColor = vec4(1, 0, 0, 1);
    } else {
      gl_FragColor = vec4(col, 1.);
    }*/
  }
`

onMounted(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (canvas === null) return

  resizeCanvasToDisplaySize(canvas)

  var gl = canvas.getContext('webgl')
  if (gl === null) return

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const program = createProgram(gl, vertexShader, fragmentShader)

  // ----------------------- VERTICES -----------------------
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
  const positionBuffer = gl.createBuffer()

  const positions = [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(positionAttributeLocation)

  const size = 2 // 3 components per iteration
  const type = gl.FLOAT // the data is 32bit floats
  const normalize = false // don't normalize the data
  const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0 // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)

  // ----------------------- UNIFORMS -----------------------
  // have to set uniform locations after we call use program
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  const light1UniformLocation = gl.getUniformLocation(program, 'u_light1_transform')
  const light2UniformLocation = gl.getUniformLocation(program, 'u_light2_transform')
  const light3UniformLocation = gl.getUniformLocation(program, 'u_light3_transform')

  // ----------------------- ANIMATE -----------------------

  const animate = (delta: number) => {
    const t = delta / 10000
    if (gl === null) return

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    resizeCanvasToDisplaySize(canvas)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)

    const rm1 = createRotationMatrix4(t * 3 * Math.PI, 0, 0)
    gl.uniformMatrix4fv(light1UniformLocation, false, matrixToColumnMajorArray(rm1))

    const rm2 = createRotationMatrix4(0, t * 2.5 * Math.PI, 0)
    gl.uniformMatrix4fv(light2UniformLocation, false, matrixToColumnMajorArray(rm2))

    const rm3 = createRotationMatrix4(0, 0, t * 5 * Math.PI)
    gl.uniformMatrix4fv(light3UniformLocation, false, matrixToColumnMajorArray(rm3))

    gl.drawArrays(gl.TRIANGLES, 0, 6)
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
})
</script>

<template>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>
