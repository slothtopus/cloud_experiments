  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
precision mediump float;

  #define MAX_STEPS 100
  #define MAX_DIST 100.
  #define SURF_DIST .01

uniform vec2 u_resolution;
uniform float u_random[200];
uniform float u_time;

varying vec2 v_position;

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float GetDist(vec3 p, vec2 x_bounds) {
    float z = 50.;
    float r = 2.;

    float x_max = x_bounds[1] * z + r;

    float d = 1000.;
    const int n = 10;
    for(int i = 0; i < n; i++) {
        float rand_val_1 = u_random[i];
        float rand_val_2 = u_random[i + n];

        float x_stretch = 1. + rand_val_1 * 3.;
        float t = fract(u_time / x_stretch) * 2. - 1.;
        float x = t * x_max * x_stretch;
        float y = (rand_val_2 - 0.5) * z / 2.;
        d = min(d, sdSphere(p - vec3(x, y, -z), r));
    }
    return d;

    /*float d = sdSphere(p - vec3(x, 0, -z), r);
    d = min(d, sdSphere(p - vec3(x, -10, -z), r));
    return d;*/
    /*vec3 o = vec3(x, 0, -z);
    return sdSphere(p - o, r);*/
}

float RayMarch(vec3 ro, vec3 rd, vec2 x_bounds) {
    float dO = 0.;
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = GetDist(p, x_bounds);
        dO += dS;
        if(dO > MAX_DIST || dS < SURF_DIST)
            break;
    }
    return dO;
}

void main() {
    vec3 ro = vec3(0, 0, 0);

    /*vec2 aspectDivide;
    if(u_resolution.x > u_resolution.y) {
        aspectDivide = vec2(u_resolution.x / u_resolution.y, 1);
    } else {
        aspectDivide = vec2(1, u_resolution.y / u_resolution.x);
    }*/

    float aspectRatio = u_resolution.x / u_resolution.y;
    float fov = 0.25;
    vec2 x_bounds = vec2(-aspectRatio * fov, aspectRatio * fov);

    vec2 uv = vec2(v_position.x * aspectRatio, v_position.y);
    vec3 rd = -normalize(vec3(uv * fov, 1));

    //vec3 rd = -normalize(vec3(v_position * 0.25, 1));
    float d = RayMarch(ro, rd, x_bounds);

    if(d >= MAX_DIST) {
        gl_FragColor = vec4(0.14, 0.78, 0.89, 1);
    } else {
        d = d / 2.;
        gl_FragColor = vec4(d, d, d, 1);
    }
}