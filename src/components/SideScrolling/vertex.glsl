  // an attribute will receive data from a buffer
attribute float seed;
attribute vec3 offset;

uniform float t_global;
uniform float u_random[100];
uniform vec2 u_resolution;
uniform mat4 u_projection;

varying vec3 v_position;
varying vec3 v_normalised_position;
varying vec2 v_centre;
varying vec2 v_scale;

/**
 * Returns accurate MOD when arguments are approximate integers.
 */
float modI(float a, float b) {
  float m = a - floor((a + 0.5) / b) * b;
  return floor(m + 0.5);
}

float randomNumber(float seed) {
  return u_random[int(modI(floor(seed), 100.))];
  //return fract(sin(seed * 43758.5453) * 2.343);
}

void main() {
  float _t_global = (t_global + seed) / -offset.z;
  float t = fract(_t_global) * 1.2 - 0.1;
  float x = 1. - t * 2.;
  float y = randomNumber(floor(_t_global)) * 1.5 - 0.75;

  v_position = vec3(x + offset.x, y + offset.y, offset.z);
  v_normalised_position = vec3(offset.x / abs(offset.x), offset.y / abs(offset.y), v_position.z / 3.);

  v_centre = vec2(x, y);
  v_scale = vec2(abs(offset.x), abs(offset.y));

  gl_Position = vec4(v_position.xy, v_position.z / 3., 1);
}