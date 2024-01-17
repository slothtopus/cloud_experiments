  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
precision mediump float;

varying vec3 v_normalised_position;
varying float v_rand;

// The texture.
uniform sampler2D u_texture;

void main() {

  float seed = fract(sin(v_rand * 47.432) * cos(v_rand * 31.423) * 324.432);
  /*if(v_normalised_position.x < 0. && v_normalised_position.y < 0.) {
    gl_FragColor = vec4(texture2D(u_texture, vec2(seed, 0)).xyz, 1);
  } else if(v_normalised_position.x > 0. && v_normalised_position.y < 0.) {
    gl_FragColor = vec4(texture2D(u_texture, vec2(seed, 0.1)).xyz, 1);
  } else if(v_normalised_position.x > 0. && v_normalised_position.y > 0.) {
    gl_FragColor = vec4(texture2D(u_texture, vec2(seed, 0.2)).xyz, 1);
  } else {*/
  gl_FragColor = vec4(texture2D(u_texture, vec2(seed, 0.2)).xyz, 1);
  //}
}