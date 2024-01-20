  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
precision mediump float;

varying vec2 v_position;

void main() {
    vec4 darkBlue = vec4(0.05, 0.33, 0.71, 1);
    vec4 lightBlue = vec4(0.36, 0.6, 0.82, 1);

    float p = (v_position.y + 1.) / 2.;
    gl_FragColor = p * darkBlue + (1. - p) * lightBlue;
}