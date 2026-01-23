precision highp float;

#define POST_GEOMETRY_DATA
struct PostGeometryData {
    vec3 positionWC;//位置坐标（世界空间）
    vec3 positionEC;//位置坐标（相机空间）
    vec3 positionGC;//投影到椭球表面的位置坐标（世界空间）
    vec3 normalWC;//法线坐标（世界空间）
    vec3 normalEC;//法线坐标（相机空间）
    vec3 normalGC;//投影到椭球表面的法线坐标（世界空间）
    vec2 uv;//投影到椭球表面的纹理坐标
    float height;//海拔高度
    float depth;//深度
    bool isSky;//天空标记，true表示当前点为天空背景
    vec4 sceneColor;
};
#include <post_getGeometryData>
PostGeometryData geometry;

// ====================== Cloud params ===================================

struct Sphere {
    vec3 center;
    float radius;
};

struct Ray {
    vec3 origin;
    vec3 dir;
};

#define NEAR_PLANE czm_currentFrustum.x
#define FAR_PLANE czm_currentFrustum.y

#define CLOUDS_SCALE 0.1e-3
#define CLOUDS_HEIGHT 20000.0
#define CLOUDS_SPEED vec3(0.25, 0.037, 0.0)*0.5
#define CLOUDS_THICKNESS 3500.0
#define CLOUD_SMOOTHNESS 0.65
#define CLOUD_COVERAGE 0.5
#define CLOUD_STEPS 128
#define CLOUD_LIGHT_STEPS 6
#define DENSITY 1.0
#define ABSORPTION 5.e-5
#define SCATTERING 7.e-4
#define SUN_INTENSITY_CLOUDS 20.0
#define AMBIENT_LIGHT_STRENGTH_CLOUDS 5.0
#define UINT_MAX float(0xffffffffu)

#define PI 3.14159
#define PI2 6.28318531
#define FLT_MAX 3.402823466e+38

#define MAX_MARCHING_STEPS 300
#define MAX_MARCHING_STEPS_SHADOW 80

#define MIN_DIST 0.001
#define SHADOW_SOFTNESS 32.0 

#define iTime czm_frameNumber/120.
#define ZERO 0

vec3 rayPointAtParameter(Ray r, float t) {
    return (r.origin + r.dir * t);
}

// Returns density gradient for clouds
// Density is lower in bottom and top parts of the clouds
float cloudHeightGradient(float height) {
    const float edge = 0.35 * CLOUDS_THICKNESS;
    return smoothstep(0.0, edge, height - CLOUDS_HEIGHT) *
        smoothstep(0.0, edge, CLOUDS_HEIGHT + CLOUDS_THICKNESS - height);
}

// Credit: https://jcgt.org/published/0009/03/02/
// hash function for generating 32-bit unsigned integers
uint hashPCGu(uint x) {
    uint state = x * 747796405u + 2891336453u;
    uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

float hashPCG(vec3 x) {
    x += 3250000.;
    x = abs(x);
    uvec3 p = uvec3(floor(x));
    return float(hashPCGu(149u * p.x ^ 233u * p.y ^ 157u * p.z)) / UINT_MAX;
}

// Value noise with 3D input
// Credit: https://www.shadertoy.com/view/4sfGzS
float vnoise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    return mix(mix(mix(hashPCG(i + vec3(0, 0, 0)), hashPCG(i + vec3(1, 0, 0)), f.x), mix(hashPCG(i + vec3(0, 1, 0)), hashPCG(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(hashPCG(i + vec3(0, 0, 1)), hashPCG(i + vec3(1, 0, 1)), f.x), mix(hashPCG(i + vec3(0, 1, 1)), hashPCG(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

float fbmCloud(vec3 p) {
    p = CLOUDS_SCALE * p + iTime * CLOUDS_SPEED + vec3(czm_viewerPositionWC.x, 0.0, czm_viewerPositionWC.z) * CLOUDS_SCALE;
    float G = exp2(-CLOUD_SMOOTHNESS);
    float f = 1.0;
    float a = 0.5;
    float t = 0.0;

    for(int i = ZERO; i < 6; i++) {
        float n = vnoise3(f * p);
        t += a * n;
        f *= 2.5789;
        a *= G;
    }

    //t = clamp(1.0*t, 0.0, 1.0);

    t *= 0.6;

    float cov = 0.6 - 0.35 * CLOUD_COVERAGE;

    t *= smoothstep(cov, cov + 0.05, t);
    //t = clamp(t, 0.0, 1.0);

    return t * DENSITY;
}

// finds intersection of the ray with the sphere from outside the sphere
float intersectRaySphereOutside(Ray ray, Sphere sphere) {
    vec3 oc = ray.origin - sphere.center;
    float a = dot(ray.dir, ray.dir);
    float b = dot(oc, ray.dir);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - a * c;
    if(discriminant < 0.0) {
		// no intersection
        return -1.0;
    } else {
        float t = (-b - sqrt(b * b - a * c)) / a;
        if(t > NEAR_PLANE)
            return t;
        else
            return -1.0;
    }
}

// finds intersection of the ray with the sphere from inside the sphere
float intersectRaySphereInside(Ray ray, Sphere sphere) {
    vec3 oc = ray.origin - sphere.center;
    float a = dot(ray.dir, ray.dir);
    float b = dot(oc, ray.dir);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - a * c;
    if(discriminant < 0.0) {
		// no intersection
        return -1.0;
    } else {
        float t = (-b + sqrt(b * b - a * c)) / a;
        if(t > NEAR_PLANE)
            return t;
        else
            return -1.0;
    }
}

float renderClouds(Ray r) {
    int steps = CLOUD_STEPS;

    if(steps <= 0)
        return 0.;

    Sphere clouds;
    float height = wgs84_getHeight(czm_viewerPositionWC);// length(r.origin) - longR;

    // find intersections with boundaries of cloud layer
    float tMin, tMax;

    if(height < (CLOUDS_HEIGHT + CLOUDS_THICKNESS)) {
        clouds = Sphere(vec3(0., 0., 0.), longR + CLOUDS_HEIGHT);
        // camera is below or inside the clouds

        if(height < CLOUDS_HEIGHT) {
            // camera is below the clouds
            tMin = intersectRaySphereInside(r, clouds);
            clouds.radius += CLOUDS_THICKNESS;
            tMax = intersectRaySphereInside(r, clouds);
        } else {
            // camera is inside the clouds
            tMin = 0.0;

            float inner = intersectRaySphereOutside(r, clouds);
            clouds.radius += CLOUDS_THICKNESS;
            float outer = intersectRaySphereInside(r, clouds);

            if(inner < 0.0)
                tMax = outer;
            else if(outer < 0.0)
                tMax = inner;
            else
                tMax = min(inner, outer);
        }
    } else {
        // camera is above the clouds
        clouds = Sphere(vec3(0., 0., 0.), longR + CLOUDS_HEIGHT + CLOUDS_THICKNESS);

        tMin = intersectRaySphereOutside(r, clouds);

        if(tMin < 0.0)
            return 0.;
        clouds.radius -= CLOUDS_THICKNESS;
        tMax = intersectRaySphereOutside(r, clouds);
    }

    //if (tMin > FAR_PLANE) return vec4(-1.0);

    float stepLength = (tMax - tMin) / float(steps);
    //const float stepLength = 45.;

    float tCurrent = tMin;
    float transmittance = 1.0;
    const float extinction = ABSORPTION + SCATTERING;

    while(tCurrent <= tMax) {
        vec3 samplePosition = r.origin + tCurrent * r.dir;

        float density = fbmCloud(samplePosition);

        // low density - no need to compute lighting
        if(density <= 0.001) {
            tCurrent += stepLength;
            continue;
        }

        height = length(samplePosition) - longR;
        density *= cloudHeightGradient(height);

        float extinctionCoeff = max(0.000000001, density * extinction);

        // amount of light coming from sun to this point
        float stepTransmittance = exp(-extinctionCoeff * stepLength);

        transmittance *= stepTransmittance;

        if(transmittance < 0.02)
            break;
        tCurrent += stepLength;
    }

    return transmittance;
}

Ray r;

void main() {
    geometry = getGeometryData();

    vec3 color = vec3(0.);
    r.origin = czm_viewerPositionWC;
    r.dir = -normalize(czm_viewerPositionWC - geometry.positionWC);

    float alpha = renderClouds(r);

    out_FragColor = vec4(mix(geometry.sceneColor.rgb, vec3(1.), alpha), 1.);

}
