// an attribute will receive data from a buffer
precision mediump float;

attribute vec3 a_offsets;
attribute vec2 a_topleft;

uniform vec2 u_screen_resolution;
uniform vec2 u_rect_resolution;
uniform float u_time;
uniform float u_d;
uniform float u_zdepth;

varying vec3 v_normalised_position;
varying float v_rand;

float modulo(float a, float b) {
  return a - (floor(a / b) * b);
}

void main() {
  float x = -modulo(a_topleft.x + u_time, u_d) + u_d / 2.;

  float rand = floor((a_topleft.x + u_time + a_topleft.y) / u_d) + a_topleft.x + a_topleft.y;
  v_rand = rand;

  float y = a_topleft.y;
  float s_aspect = u_screen_resolution.y / u_screen_resolution.x;

  gl_Position = vec4((x + a_offsets.x) * s_aspect, y + a_offsets.y, a_offsets.z, 1);
  gl_Position.x = gl_Position.x / -gl_Position.z;
  gl_Position.y = gl_Position.y / -gl_Position.z;
  gl_Position.z = gl_Position.z / u_zdepth;

  float x_norm = (2. * a_offsets.x) / u_rect_resolution.x - 1.;
  float y_norm = (2. * a_offsets.y) / u_rect_resolution.y + 1.;
  float r_aspect = u_rect_resolution.x / u_rect_resolution.y;
  v_normalised_position = vec3(x_norm * r_aspect, y_norm, gl_Position.z);
}