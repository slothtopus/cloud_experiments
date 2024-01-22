// an attribute will receive data from a buffer
precision mediump float;

  #define MAX_STEPS 100
  #define MAX_DIST 100.
  #define SURF_DIST .01

uniform mat4 u_box_transform_inverse;
uniform float u_stepsize;
uniform int u_max_depth_steps;

uniform vec2 u_resolution;

varying vec2 v_position;

// Perform ray marching to find the intersection point
/*vec3 rayMarchEntry(vec3 rayOrigin, vec3 rayDirection, float maxDistance, float minDistance) {
    float totalDistance = 0.0;
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 currentPosition = rayOrigin + totalDistance * rayDirection;
        float distanceToSurface = SDF(currentPosition);
        if(distanceToSurface < minDistance) {
            return currentPosition; // Entry point found
        }
        totalDistance += distanceToSurface;
        if(totalDistance >= maxDistance)
            break;
    }
    return vec3(0.0); // No intersection
}*/

// Perform ray marching to find the intersection point
/*vec3 rayMarchD(vec3 rayOrigin, vec3 rayDirection, float maxDistance, float minDistance) {
    float totalDistance = 0.0;
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 currentPosition = rayOrigin + totalDistance * rayDirection;
        float distanceToSurface = SDF(currentPosition);
        if(distanceToSurface < minDistance) {
            return currentPosition; // Entry point found
        }
        totalDistance += distanceToSurface;
        if(totalDistance >= maxDistance)
            break;
    }
    return vec3(0.0); // No intersection
}*/

// Calculate the thickness of the object
/*float calculateThickness(vec3 entryPoint, vec3 rayDirection, float maxDistance, float minDistance) {
    float totalDistance = 0.0;
    vec3 currentPosition = entryPoint;
    for(int i = 0; i < MAX_STEPS; i++) {
        currentPosition += rayDirection * minDistance; // Small step to ensure we start inside the object
        totalDistance += minDistance;
        float distanceToSurface = SDF(currentPosition);
        if(distanceToSurface > minDistance) {
            return totalDistance; // Exit point found
        }
        if(totalDistance >= maxDistance)
            break;
    }
    return totalDistance; // Object may be infinitely thick
}*/

// Main function to find entry and exit points
/*float findObjectThickness(vec3 rayOrigin, vec3 rayDirection) {
    vec3 entryPoint = rayMarchEntry(rayOrigin, rayDirection, MAX_DISTANCE, MIN_DISTANCE);
    if(entryPoint == vec3(0.0))
        return 0.0; // No intersection
    float thickness = calculateThickness(entryPoint, rayDirection, MAX_DISTANCE, MIN_DISTANCE);
    return thickness;
}*/

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sceneDistance(vec3 p) {
    vec4 p_transformed = u_box_transform_inverse * vec4(p, 1);
    return sdBox(p_transformed.xyz, vec3(2, 2, 2));
}

float RayMarch(vec3 ro, vec3 rd) {
    float dO = 0.;
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = sceneDistance(p);
        dO += dS;
        if(dO > MAX_DIST || dS < SURF_DIST)
            break;
    }
    return dO;
}

float calculateThickness(vec3 entryPoint, vec3 rayDirection) {
    float totalDistance = 0.0;
    vec3 currentPosition = entryPoint;
    for(int i = 0; i < 10000; i++) {
        currentPosition += rayDirection * u_stepsize; // Small step to ensure we start inside the object
        totalDistance += u_stepsize;
        float distanceToSurface = sceneDistance(currentPosition);
        if(i >= u_max_depth_steps)
            break;
        if(distanceToSurface > SURF_DIST) {
            return totalDistance; // Exit point found
        }
        if(abs(totalDistance) >= MAX_DIST)
            break;
    }
    return totalDistance; // Object may be infinitely thick
}

void main() {
    // camera position
    vec3 ro = vec3(0, 0, 5);
     // can take ray direction as this because our camera is at 0,0
    float zoom = 3.;
    vec3 rd = normalize(vec3(v_position.x * (u_resolution.x / u_resolution.y) / zoom, v_position.y / zoom, -1));

    float d = RayMarch(ro, rd);

    if(d >= 20.) {
        gl_FragColor = vec4(0, 0, 0, 1);
    } else {
        vec3 p = ro + rd * d;

        float thickness = calculateThickness(p, rd);

        //d = d / 20.;

        // Beer's law
        float a = 0.35; // absorption coefficient
        float l = exp(-thickness * a);
        gl_FragColor = vec4(1. - l, 1. - l, 1. - l, 1);
    }

}