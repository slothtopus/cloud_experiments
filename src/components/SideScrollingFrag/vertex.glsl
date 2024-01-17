// an attribute will receive data from a buffer
attribute vec2 a_position;

uniform vec2 u_resolution;

varying vec2 v_position;

void main() {
  /*vec2 aspectDivide;
  if(u_resolution.x > u_resolution.y) {
    aspectDivide = vec2(u_resolution.x / u_resolution.y, 1);
  } else {
    aspectDivide = vec2(1, u_resolution.y / u_resolution.x);
  }*/

  gl_Position = vec4(a_position.xy, 0, 1);

  v_position = a_position;
}