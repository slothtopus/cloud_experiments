  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
precision mediump float;

//varying vec3 v_normalised_position;

varying float y_top;

void main() {
  /*vec4 darkBlue = vec4(0.05, 0.33, 0.71, 1);
  vec4 lightBlue = vec4(0.36, 0.6, 0.82, 1);

  float p = (v_normalised_position.y + 1.) / 2.;
  gl_FragColor = p * darkBlue + (1. - p) * lightBlue;*/

  gl_FragColor = vec4((y_top + 2.) / 4., 0, 0, 1);
}