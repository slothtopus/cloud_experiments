  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
precision mediump float;

varying vec3 v_position;
varying vec3 v_normalised_position;

void main() {
    if(v_position.z == -1.) {
        gl_FragColor = vec4(v_normalised_position.x, v_normalised_position.x, v_normalised_position.x, 1);
    } else if(v_position.z == -2.) {
        gl_FragColor = vec4(v_normalised_position.y, v_normalised_position.y, v_normalised_position.y, 1);
    } else if(v_position.z == -3.) {
        gl_FragColor = vec4(v_position.x, v_position.y, v_position.z, 1);
    } else {
        gl_FragColor = vec4(1, 1, 0, 0.5);
    }
}