precision mediump float;

attribute vec2 a_quad;

varying vec2 v_position;

void main() {
    gl_Position = vec4(a_quad, 0, 1);
    v_position = a_quad;
}