  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
precision mediump float;

  #define MAX_STEPS 100
  #define MAX_DIST 100.
  #define SURF_DIST .01

varying vec3 v_normalised_position;

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float GetDist(vec3 p) {
  return sdSphere(p - vec3(0, 0, 0), 1.);
}

float RayMarch(vec3 ro, vec3 rd) {
  float dO = 0.;
  for(int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;
    float dS = GetDist(p);
    dO += dS;
    if(dO > MAX_DIST || dS < SURF_DIST)
      break;
  }
  return dO;
}

vec3 GetNormal(vec3 p) {
  float d = GetDist(p);
  vec2 e = vec2(.01, 0);

  vec3 n = d - vec3(GetDist(p - e.xyy), GetDist(p - e.yxy), GetDist(p - e.yyx));

  return normalize(n);
}

void main() {

  vec3 ro = vec3(0, 0, -1.75);
  vec3 rd = normalize(vec3(v_normalised_position.x, v_normalised_position.y, 1));

  float d = RayMarch(ro, rd);

  if(d < 10.) {
    vec3 p = ro + rd * d;
    gl_FragColor = vec4(GetNormal(p), 1);
  } else {
    gl_FragColor = vec4(v_normalised_position.yyy, 1);
  }
}