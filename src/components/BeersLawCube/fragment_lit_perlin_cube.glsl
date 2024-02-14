// an attribute will receive data from a buffer
precision mediump float;

  #define MAX_STEPS 100
  #define MAX_DIST 100.
  #define SURF_DIST .01

uniform mat4 u_box_transform_inverse;
uniform mat4 u_box_transform;
uniform mat4 u_light_transform;
uniform float u_stepsize;
uniform float u_time;
uniform int u_max_depth_steps;

uniform vec2 u_resolution;

varying vec2 v_position;

vec3 randomGradient3d(vec3 p, float seed) {
    p = p + 0.01;
    float x = dot(p, vec3(123.4, 234.5, 345.6));
    float y = dot(p, vec3(234.5, 345.6, 456.7));
    float z = dot(p, vec3(345.6, 456.7, 567.8));
    vec3 gradient = vec3(x, y, z);
    gradient = sin(gradient);
    //gradient *= 43758.5453;
    gradient *= (43758.5453 + seed);
    gradient = sin(gradient + u_time * 8.);
    //gradient = sin(gradient);
    return gradient;
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

// Noise ranges from [0.1, 1]
// (well it used to)
float generateNoise(vec3 p) {
    return min(max(perlin3d(p, 2.5, 69.), 0.) + 0.5, 1.);
    //return 1.0;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdEllipsoid(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / k1;
}

float sceneDistanceTransformed(vec3 p) {
    vec4 p_transformed = u_box_transform_inverse * vec4(p, 1);
    return sdBox(p_transformed.xyz, vec3(2, 2, 2));
    //return sdEllipsoid(p_transformed.xyz, vec3(3, 2, 2));
}

float RayMarch(vec3 ro, vec3 rd) {
    float dO = 0.;
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = sceneDistanceTransformed(p);
        dO += dS;
        if(dO > MAX_DIST || dS < SURF_DIST)
            break;
    }
    return dO;
}

float calculateDensity(vec3 entryPoint, vec3 rayDirection) {
    //vec3 transformedEntryPoint = (u_box_transform * vec4(entryPoint, 1)).xyz;
    float totalDensity = 0.0;
    vec3 currentPosition = entryPoint;

    for(int i = 0; i < 10000; i++) {
        currentPosition += rayDirection * u_stepsize; // Small step to ensure we start inside the object
        float noise = perlin3d((u_box_transform_inverse * vec4(currentPosition, 1)).xyz, 2.0, 69.);
        totalDensity += u_stepsize * exp(1.5 * noise);
        float distanceToSurface = sceneDistanceTransformed(currentPosition);
        if(i >= u_max_depth_steps)
            break;
        if(distanceToSurface > SURF_DIST) {
            break; // Exit point found
        }
    }
    return totalDensity;
}

vec2 calculateLight(vec3 entryPoint, vec3 rayDirection) {
    //vec3 transformedEntryPoint = (u_box_transform * vec4(entryPoint, 1)).xyz;

    //vec3 lightPosition = (u_box_transform_inverse * vec4(0, 10, -20, 1.)).xyz;

    vec3 lightPosition = (u_light_transform * vec4(0, 0, -20, 1)).xyz;

    float cameraRayDensity = 0.0;
    float totalLightEmittedToCamera = 0.0;
    vec3 currentRayPosition = entryPoint;

    float ABSORPTION = 0.45;

    for(int i = 0; i < 10000; i++) {
        currentRayPosition += rayDirection * u_stepsize; // Small step to ensure we start inside the object
        float noise1 = generateNoise((u_box_transform_inverse * vec4(currentRayPosition, 1)).xyz);
        cameraRayDensity += u_stepsize * noise1;

        float distanceToSurface1 = sceneDistanceTransformed(currentRayPosition);
        if(i >= u_max_depth_steps)
            break;
        if(distanceToSurface1 > SURF_DIST) {
            break; // Exit point found
        }

        // Get density-weighted distance of ray from currentRayPosition to light
        vec3 lightDirection = normalize(lightPosition - currentRayPosition);
        vec3 currentLightPosition = currentRayPosition;
        float lightTravelDensity = 0.0;

        for(int j = 0; j < 10000; j++) {
            float noise2 = generateNoise((u_box_transform_inverse * vec4(currentLightPosition, 1)).xyz);
            lightTravelDensity += u_stepsize * noise2;
            currentLightPosition += lightDirection * u_stepsize;
            float distanceToSurface2 = sceneDistanceTransformed(currentLightPosition);
            if(j >= u_max_depth_steps)
                break;
            if(distanceToSurface2 > SURF_DIST) {
                break; // Exit point found
            }
        }

        float lightReachingSamplePoint = exp(-lightTravelDensity * ABSORPTION);

        float lightEmittedTowardsCameraFromPoint = lightReachingSamplePoint * exp(-cameraRayDensity * ABSORPTION);
        totalLightEmittedToCamera += lightEmittedTowardsCameraFromPoint * u_stepsize;
    }
    return vec2(exp(-cameraRayDensity * ABSORPTION), totalLightEmittedToCamera);
}

void main() {
    // camera position
    vec3 ro = vec3(0, 0, 5);
     // can take ray direction as this because our camera is at 0,0
    float zoom = 3.;
    vec3 rd = normalize(vec3(v_position.x * (u_resolution.x / u_resolution.y) / zoom, v_position.y / zoom, -1));

    float d = RayMarch(ro, rd);

    if(d >= 20.) {
        gl_FragColor = vec4(0.05, 0.33, 0.71, 1);
    } else {
        vec3 p = ro + rd * d;

        vec2 lightVals = calculateLight(p, rd);

        float cloudDensity = clamp(lightVals.x, 0.0, 1.0);
        float lightIntensity = clamp(lightVals.y / 2.0, 0.0, 1.0);
        //float lightIntensity = 0.25;

        vec3 cloudColour = lightIntensity * vec3(1., 1., 1.) + (1. - lightIntensity) * vec3(0.25, 0.25, 0.25);
        //vec3 cloudColour = vec3(1, 1, 1);

        //gl_FragColor = cloudDensity * cloudColour + (1. - cloudDensity) * vec4(0.05, 0.33, 0.71, 1);

        //gl_FragColor = vec4(cloudColour, 1);

        //cloudDensity = 1.0 - cloudDensity;
        //cloudDensity *= 2.0;

        cloudDensity = 1.0 - cloudDensity;
        cloudDensity *= 3.5;
        cloudDensity = clamp(cloudDensity - 0.5, 0.0, 1.0);
        gl_FragColor = vec4(cloudDensity * cloudColour + (1. - cloudDensity) * vec3(0.05, 0.33, 0.71), 1.0);

        //gl_FragColor = vec4(clamp(cloudDensity, 0.0, 1.0), clamp(cloudDensity, 1.0, 2.0) - 1.0, clamp(cloudDensity, 2.0, 3.0) - 2.0, 1);

        //gl_FragColor = vec4(cloudDensity * cloudColour + (1. - cloudDensity) * vec3(0.05, 0.33, 0.71), 1);

        /*float density = calculateDensity(p, rd);
        float a = 0.75; // absorption coefficient
        float l = exp(-density * a);
        l = l * 2.75;
        gl_FragColor = vec4(max(1. - l, 0.) * vec3(1, 1, 1) + min(l, 1.0) * vec3(0.05, 0.33, 0.71), 1);*/
    }

}