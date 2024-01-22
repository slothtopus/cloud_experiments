precision mediump float;

varying vec2 v_position;

uniform vec2 u_resolution;
uniform float u_time;

/*float modulo(float a, float b) {
    return a - (floor(a / b) * b);
}*/

vec2 randomGradient2d(vec2 p, float seed) {
    p = p + 0.01;
    float x = dot(p, vec2(123.4, 234.5));
    float y = dot(p, vec2(234.5, 345.6));
    vec2 gradient = vec2(x, y);
    gradient = sin(gradient);
    //gradient *= 43758.5453;
    gradient *= (43758.5453 + seed);
    //gradient = sin(gradient + u_time);
    gradient = sin(gradient);
    return gradient;
}

vec3 randomGradient3d(vec3 p, float seed) {
    p = p + 0.01;
    float x = dot(p, vec3(123.4, 234.5, 345.6));
    float y = dot(p, vec3(234.5, 345.6, 456.7));
    float z = dot(p, vec3(345.6, 456.7, 567.8));
    vec3 gradient = vec3(x, y, z);
    gradient = sin(gradient);
    //gradient *= 43758.5453;
    gradient *= (43758.5453 + seed);
    //gradient = sin(gradient + u_time);
    gradient = sin(gradient);
    return gradient;
}

float perlin2d(vec2 uv, float k, float seed) {
    uv = uv * k;

    vec2 gridId = floor(uv);
    vec2 gridUv = fract(uv);

    vec2 bl = gridId + vec2(0, 0);
    vec2 br = gridId + vec2(1, 0);
    vec2 tl = gridId + vec2(0, 1);
    vec2 tr = gridId + vec2(1, 1);

    vec2 gradBl = randomGradient2d(bl, seed);
    vec2 gradBr = randomGradient2d(br, seed);
    vec2 gradTl = randomGradient2d(tl, seed);
    vec2 gradTr = randomGradient2d(tr, seed);

    vec2 vFromBl = gridUv - vec2(0, 0);
    vec2 vFromBr = gridUv - vec2(1, 0);
    vec2 vFromTl = gridUv - vec2(0, 1);
    vec2 vFromTr = gridUv - vec2(1, 1);

    float dotBl = dot(gradBl, vFromBl);
    float dotBr = dot(gradBr, vFromBr);
    float dotTl = dot(gradTl, vFromTl);
    float dotTr = dot(gradTr, vFromTr);

    gridUv = smoothstep(0.0, 1.0, gridUv);

    float b = mix(dotBl, dotBr, gridUv.x);
    float t = mix(dotTl, dotTr, gridUv.x);
    float perlin = mix(b, t, gridUv.y);

    return perlin;
}

float perlin3d(vec3 uv, float k, float seed) {
    uv = uv * k;

    vec3 gridId = floor(uv);
    vec3 gridUv = fract(uv);

    // using right-handed coordinate system
    // f = front, r = rear
    vec3 rbl = gridId + vec3(0, 0, 0);
    vec3 rbr = gridId + vec3(1, 0, 0);
    vec3 rtl = gridId + vec3(0, 1, 0);
    vec3 rtr = gridId + vec3(1, 1, 0);

    vec3 fbl = gridId + vec3(0, 0, 1);
    vec3 fbr = gridId + vec3(1, 0, 1);
    vec3 ftl = gridId + vec3(0, 1, 1);
    vec3 ftr = gridId + vec3(1, 1, 1);

    vec3 gradRbl = randomGradient3d(rbl, seed);
    vec3 gradRbr = randomGradient3d(rbr, seed);
    vec3 gradRtl = randomGradient3d(rtl, seed);
    vec3 gradRtr = randomGradient3d(rtr, seed);

    vec3 gradFbl = randomGradient3d(fbl, seed);
    vec3 gradFbr = randomGradient3d(fbr, seed);
    vec3 gradFtl = randomGradient3d(ftl, seed);
    vec3 gradFtr = randomGradient3d(ftr, seed);

    vec3 vFromRbl = gridUv - vec3(0, 0, 0);
    vec3 vFromRbr = gridUv - vec3(1, 0, 0);
    vec3 vFromRtl = gridUv - vec3(0, 1, 0);
    vec3 vFromRtr = gridUv - vec3(1, 1, 0);

    vec3 vFromFbl = gridUv - vec3(0, 0, 1);
    vec3 vFromFbr = gridUv - vec3(1, 0, 1);
    vec3 vFromFtl = gridUv - vec3(0, 1, 1);
    vec3 vFromFtr = gridUv - vec3(1, 1, 1);

    float dotRbl = dot(gradRbl, vFromRbl);
    float dotRbr = dot(gradRbr, vFromRbr);
    float dotRtl = dot(gradRtl, vFromRtl);
    float dotRtr = dot(gradRtr, vFromRtr);

    float dotFbl = dot(gradFbl, vFromFbl);
    float dotFbr = dot(gradFbr, vFromFbr);
    float dotFtl = dot(gradFtl, vFromFtl);
    float dotFtr = dot(gradFtr, vFromFtr);

    gridUv = smoothstep(0.0, 1.0, gridUv);

    float Rb = mix(dotRbl, dotRbr, gridUv.x);
    float Rt = mix(dotRtl, dotRtr, gridUv.x);
    float R = mix(Rb, Rt, gridUv.y);

    float Fb = mix(dotFbl, dotFbr, gridUv.x);
    float Ft = mix(dotFtl, dotFtr, gridUv.x);
    float F = mix(Fb, Ft, gridUv.y);

    float perlin = mix(R, F, gridUv.z);

    return perlin;
}

void main() {
    vec2 uv = vec2((v_position.x * (u_resolution.x / u_resolution.y) + 1.) / 2., (v_position.y + 1.) / 2.);

    //float perlin1 = perlin2d(uv, 5., 103.);
    float perlin1 = perlin3d(vec3(uv, fract(u_time)), 10., 103.);

    gl_FragColor = vec4(vec3(perlin1, perlin1, perlin1) + 0.3, 1);
}