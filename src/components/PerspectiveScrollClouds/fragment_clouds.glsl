  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
precision mediump float;

  #define MAX_STEPS 100
  #define MAX_DIST 100.
  #define SURF_DIST .01

varying vec3 v_normalised_position;
varying float v_rand;

uniform float u_time;
uniform float u_scroll_pct;
//uniform vec2 u_mouse;
uniform sampler2D u_texture;

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float randRange(float rand, float lower, float upper) {
    return rand * (upper - lower) + lower;
}

float sdSphereRand(vec3 p, float x, vec4 rand) {
    float xJitter = x + randRange(rand.x, -0.1, 0.1);
    float y = randRange(rand.y, -0.4, 0.4);
    float z = randRange(rand.z, -0.25, 0.25);
    float r = randRange(rand.w, 0.4, 0.7);

    float speedup = 10.;
    float xMod = 1. - sin(u_time * speedup * rand.w) * 0.1;
    float yMod = 1. - cos(u_time * speedup * rand.z) * 0.1;
    float zMod = 1. - sin(u_time * speedup * rand.y) * 0.1;
    float rMod = 1. - sin(u_time * speedup * rand.x) * 0.1;

    return sdSphere(p - vec3(xJitter, y, z) * vec3(xMod, yMod, zMod), r * rMod);
}

float smoothUnionSDF(float distA, float distB, float k) {
    float h = clamp(0.5 + 0.5 * (distA - distB) / k, 0., 1.);
    return mix(distA, distB, h) - k * h * (1. - h);
}

float GetDist(vec3 p, vec4 rands[13]) {

    float k = 0.15;
    float d = sdSphereRand(p, 0., rands[0]);
    d = smoothUnionSDF(d, sdSphereRand(p, 0.25, rands[1]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, 0.5, rands[2]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, 0.75, rands[3]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, 1.0, rands[4]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, 1.25, rands[5]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, 1.5, rands[6]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, -0.25, rands[7]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, -0.5, rands[8]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, -0.75, rands[9]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, -1.0, rands[10]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, -1.25, rands[11]), k);
    d = smoothUnionSDF(d, sdSphereRand(p, -1.5, rands[12]), k);

    return d;
}

float RayMarch(vec3 ro, vec3 rd, vec4 rands[13]) {
    float dO = 0.;
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = GetDist(p, rands);
        dO += dS;
        if(dO > MAX_DIST || dS < SURF_DIST)
            break;
    }
    return dO;
}

vec3 GetNormal(vec3 p, vec4 rands[13]) {
    float d = GetDist(p, rands);
    vec2 e = vec2(.01, 0);

    vec3 n = d - vec3(GetDist(p - e.xyy, rands), GetDist(p - e.yxy, rands), GetDist(p - e.yyx, rands));

    return normalize(n);
}

float GetLight(vec3 p, vec3 lightPos, vec4 rands[13]) {
    vec3 l = normalize(lightPos - p);
    vec3 n = GetNormal(p, rands);

    float dif = clamp(dot(n, l), 0., 1.);
    return dif;
}

void main() {
    vec3 ro = vec3(0, 0, -1.75);
    vec3 rd = normalize(vec3(v_normalised_position.x, v_normalised_position.y, 1));

    float seed = fract(sin(v_rand * 47.432) * cos(v_rand * 31.423) * 324.432);
    vec4 rands[13];
    rands[0] = texture2D(u_texture, vec2(seed, 0.1));
    rands[1] = texture2D(u_texture, vec2(seed, 0.15));
    rands[2] = texture2D(u_texture, vec2(seed, 0.2));
    rands[3] = texture2D(u_texture, vec2(seed, 0.25));
    rands[4] = texture2D(u_texture, vec2(seed, 0.3));
    rands[5] = texture2D(u_texture, vec2(seed, 0.35));
    rands[6] = texture2D(u_texture, vec2(seed, 0.4));
    rands[7] = texture2D(u_texture, vec2(seed, 0.45));
    rands[8] = texture2D(u_texture, vec2(seed, 0.5));
    rands[9] = texture2D(u_texture, vec2(seed, 0.55));
    rands[10] = texture2D(u_texture, vec2(seed, 0.6));
    rands[11] = texture2D(u_texture, vec2(seed, 0.65));
    rands[12] = texture2D(u_texture, vec2(seed, 0.7));

    float d = RayMarch(ro, rd, rands);

    if(d < 10.) {
        vec3 p = ro + rd * d;
        //vec3 light1 = vec3(u_mouse.x * 2., 10. + u_mouse.y * 2., -10);
        vec3 light1 = vec3(0, 7. + (5. * u_scroll_pct), -10.);
        float light1Dif = GetLight(p, light1, rands);

        //vec4 darkCol = vec4(0.357, 0.71, 0.761, 1);
        //vec4 midCol = vec4(0.533, 0.788, 0.827, 1);
        //vec4 lightCol = vec4(0.651, 0.839, 0.871, 1);

        vec4 midCol = vec4(0.533, 0.639, 0.804, 1);
        vec4 lightCol = vec4(0.753, 0.8, 0.89, 1);
        vec4 blueingCol = vec4(0.05, 0.33, 0.71, 1);
        vec4 whiteCol = vec4(1, 1, 1, 1);

        /*if(light1Dif < 0.1) {
            gl_FragColor = darkCol;
        } else if(light1Dif < 0.3) {
            gl_FragColor = lightCol;
        } else {
            gl_FragColor = vec4(1, 1, 1, 1);
        }*/

        float darkVal = 1.;
        /*float midVal = smoothstep(0.1, 0.2, light1Dif);
        darkVal = darkVal - midVal;*/
        float lightVal = smoothstep(0.1, 0.2, light1Dif);
        darkVal = darkVal - lightVal;
        float whiteVal = smoothstep(0.5, 0.65, light1Dif);
        lightVal = lightVal - whiteVal;

        //gl_FragColor = darkVal * darkCol + midVal * midCol + lightVal * lightCol + whiteVal * whiteCol;
        gl_FragColor = darkVal * midCol + lightVal * lightCol + whiteVal * whiteCol;

        //gl_FragColor = vec4(1, 1, 1, 1) * (light1Dif) + midCol * (1. - light1Dif);
        float blueing = (v_normalised_position.z + 1.0) / (2. * 2.);
        gl_FragColor = gl_FragColor * (1. - blueing) + blueingCol * blueing;
    } else {
        //gl_FragColor = vec4(0.14, 0.78, 0.89, 1);
        gl_FragColor = vec4(0, 0, 0, 0);
    }
}