// fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
precision mediump float;

  #define MAX_STEPS 100
  #define MAX_DIST 10.
  #define SURF_DIST .01

varying vec3 v_normalised_position;

uniform float u_time;
uniform vec4 u_cloud_spheres[10];

float smoothUnionSDF(float distA, float distB, float k) {
    float h = clamp(0.5 + 0.5 * (distA - distB) / k, 0., 1.);
    return mix(distA, distB, h) - k * h * (1. - h);
}

float sdEllipsoid(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
}

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float randomNumber(int seed) {
    return fract(sin(float(seed) * 12345.));
}

float GetDist(vec3 p) {
    float d = MAX_DIST;
    for(int i = 0; i < 10; i++) {

        float speedup = 10.;
        float xMod = 1. - sin(u_time * speedup * randomNumber(i)) * 0.15;
        float yMod = 1. - cos(u_time * speedup * randomNumber(i + 200)) * 0.15;
        float zMod = 1. - sin(u_time * speedup * randomNumber(i + 300)) * 0.15;
        float rMod = 1. - sin(u_time * speedup * randomNumber(i + 400)) * 0.01;

        vec3 o = u_cloud_spheres[i].xyz * vec3(xMod, yMod, zMod);
        float r = u_cloud_spheres[i].w * rMod;
        d = smoothUnionSDF(d, sdSphere(p - o, r), 0.15);
    }
    return d;
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

float GetLight(vec3 p, vec3 lightPos) {
    vec3 l = normalize(lightPos - p);
    vec3 n = GetNormal(p);

    float dif = clamp(dot(n, l), 0., 1.);
    return dif;
}

void main() {
    //vec3 col = vec3((v_normalised_position.xy + 1.) / 2., 1.);

    vec3 ro = vec3(0, 0, -1.2);
    vec3 rd = normalize(vec3(v_normalised_position.x, v_normalised_position.y, 1));

    float d = RayMarch(ro, rd);

    if(d < 10.) {
        vec3 p = ro + rd * d;
        vec3 light1 = vec3(0, 10, -10);
        float light1Dif = GetLight(p, light1);

        /*vec3 light2 = vec3(0, 5, -5);
        float light2Dif = GetLight(p, light2);*/

        vec4 darkCol = vec4(0.357, 0.71, 0.761, 1);
        vec4 midCol = vec4(0.533, 0.788, 0.827, 1);
        vec4 lightCol = vec4(0.651, 0.839, 0.871, 1);

        if(light1Dif < 0.1) {
            gl_FragColor = darkCol;
        } else if(light1Dif < 0.3) {
            gl_FragColor = lightCol;
        } else {
            gl_FragColor = vec4(1, 1, 1, 1);
        }
    } else {
        gl_FragColor = vec4(0.14, 0.78, 0.89, 1);
    }
}