// Auto-generated from volumeCloudEffect.glsl
// Hash: 6d7f80b2
// Generated at: 2026-01-14T09:23:29.946Z

const VOLUMECLOUDEFFECT_SOURCE = `
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
};
#include <post_getGeometryData>
PostGeometryData geometry;

uniform float realPlanetRadius; //地球半径 
const float windSpeedRatio = 0.0002;//风速
uniform float cloudCover;//云量
uniform float cloudBase;//云的底部高度
uniform float cloudTop;//云的顶部高度
uniform vec3 windVector;//方向
uniform float cloudThickness; //云层厚度 
uniform float cloudBaseRadius;//云层底部半径
uniform float cloudTopRadius; //云层顶部半径 
uniform sampler2D colorTexture;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;
const float FOUR_PI = 12.5663706144; 

  #define CLOUDS_MAX_LOD 1
  #define CLOUDS_MARCH_STEP 500.0 //外部每次步进
  #define CLOUDS_DENS_MARCH_STEP 100.0 //云内每次步进
  #define MAXIMUM_CLOUDS_STEPS 300 //最大步进次数 
  #define CLOUDS_MAX_VIEWING_DISTANCE 250000.0

//射线与球体相交
vec2 raySphereIntersect(vec3 r0, vec3 rd, float sr) {
    float a = dot(rd, rd);
    float b = 2.0 * dot(rd, r0);
    float c = dot(r0, r0) - (sr * sr);
    float d = (b * b) - 4.0 * a * c;

    if(d < 0.0)
        return vec2(-1.0, -1.0);
    float squaredD = sqrt(d);

    float t0 = (-b - squaredD) / (2.0 * a);
    float t1 = (-b + squaredD) / (2.0 * a);

    // 确保t0 <= t1
    if(t0 > t1) {
        float temp = t0;
        t0 = t1;
        t1 = temp;
    }

    // 如果两个交点都在视线后方，返回无效值
    if(t1 < 0.0)
        return vec2(-1.0, -1.0);

    // 如果最近的交点在视线后方，使用最远的交点
    if(t0 < 0.0)
        return vec2(0.0, t1);

    return vec2(t0, t1);
}

  // 计算射线与球壳（云层）的相交
vec2 rayCloudLayerIntersect(vec3 rayOrigin, vec3 rayDir, float innerRadius, float outerRadius) {
    vec2 innerHit = raySphereIntersect(rayOrigin, rayDir, innerRadius);
    vec2 outerHit = raySphereIntersect(rayOrigin, rayDir, outerRadius);

    // 如果没有与任何球面相交
    if(innerHit.x < 0.0 && outerHit.x < 0.0)
        return vec2(-1.0, -1.0);

    float startDistance, endDistance;

    // 射线从外部进入云层
    if(outerHit.x >= 0.0) {
        startDistance = outerHit.x;
      // 如果与内球面相交，结束在内球面，否则结束在外球面的第二个交点
        endDistance = (innerHit.x >= 0.0) ? min(innerHit.x, outerHit.y) : outerHit.y;
    }
    // 射线从内部出发（相机在云层内）
    else if(innerHit.x >= 0.0) {
        startDistance = 0.0;
        endDistance = innerHit.x;
    }

    return vec2(startDistance, endDistance);
}

float saturate(float value) {
    return clamp(value, 0.0, 1.0);
}

float isotropic() {
    return 0.07957747154594767; //1.0 / (4.0 * PI);
}

float rayleigh(float costh) {
    return (3.0 / (16.0 * PI)) * (1.0 + pow(costh, 2.0));
}

float Schlick(float k, float costh) {
    return (1.0 - k * k) / (FOUR_PI * pow(1.0 - k * costh, 2.0));
}
float g = 0.9;

float hash(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

  //噪声
float noise(in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    float n = p.x + p.y * 157.0 + p.z * 113.0;
    return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x), mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y), mix(mix(hash(n + 113.0), hash(n + 114.0), f.x), mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
}

  //云的密度
float cloudDensity(vec3 p, vec3 wind, int lod, inout float heightRatio) {
    float finalCoverage = cloudCover;
    if(finalCoverage <= 0.1) {
        return 0.0;
    }

     // 计算当前点的高度比
    heightRatio = (length(p) - cloudBaseRadius) / (cloudThickness);
    heightRatio = saturate(heightRatio);

     // 根据LOD调整采样频率
    float lodScale = pow(2.0, float(lod));
    vec3 samplePos = p * 0.00001 + wind * 0.1;
    samplePos /= lodScale;

     // 计算形状噪声
    float shape = noise(samplePos);
    float bn = noise(samplePos * 2.0 + wind * 0.2) * 0.5;

     // 根据高度调整云的形状
    float shapeHeight = shape * pow(heightRatio, 0.5);
    float cumuloNimbus = saturate((shapeHeight - 0.5) * 2.0);
    cumuloNimbus *= saturate(1.0 - pow(heightRatio - 0.5, 2.0) * 4.0);
    float cumulus = saturate(1.0 - pow(heightRatio - 0.25, 2.0) * 25.0) * shapeHeight;
    float stratoCumulus = saturate(1.0 - pow(heightRatio - 0.12, 2.0) * 60.0) * (1.0 - shapeHeight);
    float dens = saturate(stratoCumulus + cumulus + cumuloNimbus) * 2.0 * finalCoverage;
    dens -= 1.0 - shape;
    dens -= bn;
    return clamp(dens, 0.0, 1.0);
}

precision highp float;
vec3 skyAmbientColor = vec3(0.705, 0.850, 0.952); //0.219, 0.380, 0.541
vec3 groundAmbientColor = vec3(0.741, 0.898, 0.823); //0.639, 0.858, 0.721
float distanceQualityR = 0.00005; // LOD/quality ratio
float minDistance = 10.0; // avoid cloud in cockpit  

vec4 calculate_clouds(
    vec3 start,
    vec3 dir,
    float maxDistance,
    vec3 light_dir,
    vec3 wind
) {
    vec4 cloud = vec4(0.0, 0.0, 0.0, 1.0);
    vec2 toTop = raySphereIntersect(start, dir, cloudTopRadius);
    vec2 toBase = raySphereIntersect(start, dir, cloudBaseRadius);

  // 使用修正后的射线与云层相交函数
    vec2 cloudIntersection = rayCloudLayerIntersect(start, dir, cloudBaseRadius, cloudTopRadius);
    float tmin = cloudIntersection.x;
    float tmax = cloudIntersection.y;

    // 如果没有与云层相交，返回透明
    if(tmin < 0.0 || tmax < 0.0 || tmin >= tmax) {
        return vec4(0.0);
    }

    // 计算相机高度
    float cameraHeight = length(start) - realPlanetRadius;

    // 如果相机在云层内部，从当前位置开始
    if(cameraHeight > cloudBase && cameraHeight < cloudTop) {
        tmin = 0.0;
    }

    float absoluteMaxDistance = min(maxDistance, CLOUDS_MAX_VIEWING_DISTANCE);
    tmin = max(tmin, minDistance);
    tmax = min(tmax, absoluteMaxDistance);

    if(tmax <= tmin)
        return vec4(0.0);

    float rayLength = tmax - tmin;//步进总距离
    float longMarchStep = rayLength / float(MAXIMUM_CLOUDS_STEPS);//步进距离/步进次数=每次步进的距离
    longMarchStep = max(longMarchStep, CLOUDS_MARCH_STEP);//每次步进多少

    float shortMarchStep = CLOUDS_DENS_MARCH_STEP;
    float numberApproachSteps = (CLOUDS_MARCH_STEP / CLOUDS_DENS_MARCH_STEP) * 2.0;
    float distance = tmin;//
    float dens = 0.0;
    float marchStep;

    float lastDensity;
    float kInScattering = 0.99;
    float dotLightRay = dot(dir, light_dir);
    float inScattering = Schlick(kInScattering, dotLightRay);
    float outScattering = isotropic();
    float sunScatteringPhase = mix(outScattering, inScattering, dotLightRay);
    float ambientScatteringPhase = isotropic();
    bool inCloud = false;
    float stepsBeforeExitingCloud = 0.0;

    for(int i = 0; i < MAXIMUM_CLOUDS_STEPS; i++) {
        vec3 position = start + dir * distance;
        int qualityRatio = int(distance * distanceQualityR);
        int lod = CLOUDS_MAX_LOD - qualityRatio;
        float heightRatio;

        if(inCloud == true) {
            marchStep = shortMarchStep;
        } else {
            marchStep = longMarchStep;
            lod = 0;
        }

        dens = cloudDensity(position, wind, lod, heightRatio);

        if(dens > 0.01) {
            if(inCloud != true) {
                inCloud = true;
                stepsBeforeExitingCloud = numberApproachSteps;
                distance = clamp(distance - CLOUDS_MARCH_STEP, tmin, tmax); // 第一次进入云 回退一步
                continue;
            }

        // 计算光照
            float lighting = saturate(dot(normalize(position), light_dir) * 0.5 + 0.5);
            float scatteringCoeff = 0.15 * dens;
            float extinctionCoeff = 0.01 * dens;
            cloud.a *= exp(-extinctionCoeff * marchStep);
            float sunIntensityAtSurface = clamp(0.2 - dens, 0.0, 1.0);
            vec3 sunLight = lighting * czm_lightColor * sunIntensityAtSurface * czm_lightColor.z;
            vec3 ambientSun = czm_lightColor * sunIntensityAtSurface * czm_lightColor.z * isotropic();
            vec3 skyAmbientLight = (skyAmbientColor * czm_lightColor.z + ambientSun);
            vec3 groundAmbientLight = (groundAmbientColor * czm_lightColor.z * 0.5 + ambientSun);
            vec3 ambientLight = mix(groundAmbientLight, skyAmbientLight, heightRatio);
            vec3 stepScattering = scatteringCoeff * marchStep * (sunScatteringPhase * sunLight + ambientScatteringPhase * ambientLight);
            cloud.rgb += cloud.a * stepScattering;

            if(cloud.a < 0.01) {
                cloud.a = 0.0;
                break;
            }
        } else {
            if(stepsBeforeExitingCloud > 0.0) {
                stepsBeforeExitingCloud--;
            } else {
                inCloud = false;
            }
        }

        distance += marchStep;

      //步进距离超出总的距离 退出
        if(distance > tmax) {
            break;
        }
    }
    cloud.a = (1.0 - cloud.a);
    return cloud;
}

void main() {
    geometry = getGeometryData();

    vec4 color = texture(colorTexture, v_textureCoordinates);

    // 从深度纹理中重建深度
    float depth = geometry.depth;

    vec4 positionEC = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth);
    vec4 worldCoordinate = czm_inverseView * positionEC;
    vec3 vWorldPosition = worldCoordinate.xyz / worldCoordinate.w;
    vec3 posToEye = vWorldPosition - czm_viewerPositionWC;
    vec3 direction = normalize(posToEye);
    vec3 lightDirection = normalize(czm_sunPositionWC);
    float distance = length(posToEye);

    if(depth == 1.0) {
        distance = CLOUDS_MAX_VIEWING_DISTANCE;
    }
    vec3 wind = windVector * czm_frameNumber * windSpeedRatio;
    vec4 clouds = calculate_clouds(czm_viewerPositionWC, // the position of the camera
    direction, // the camera vector (ray direction of this pixel)
    distance, // max dist, essentially the scene depth
    lightDirection, // light direction
    wind);
    clouds.rgb *= 3.0;
    color = mix(color, clouds, clouds.a * clouds.a);

    float exposure = 1.2;
    color = vec4(1.0 - exp(-exposure * color));
    out_FragColor = color;
}
`;

// Uniform 信息
export const VOLUMECLOUDEFFECT_UNIFORMS = [
  {
    "type": "float",
    "name": "realPlanetRadius"
  },
  {
    "type": "float",
    "name": "cloudCover"
  },
  {
    "type": "float",
    "name": "cloudBase"
  },
  {
    "type": "float",
    "name": "cloudTop"
  },
  {
    "type": "vec3",
    "name": "windVector"
  },
  {
    "type": "float",
    "name": "cloudThickness"
  },
  {
    "type": "float",
    "name": "cloudBaseRadius"
  },
  {
    "type": "float",
    "name": "cloudTopRadius"
  },
  {
    "type": "sampler2D",
    "name": "colorTexture"
  }
];

// Attribute 信息
export const VOLUMECLOUDEFFECT_ATTRIBUTES = [];

// Shader 类
export class VolumeCloudEffectShader {
  constructor() {
    this.source = VOLUMECLOUDEFFECT_SOURCE;
    this.uniforms = VOLUMECLOUDEFFECT_UNIFORMS;
    this.attributes = VOLUMECLOUDEFFECT_ATTRIBUTES;
    this.hash = '6d7f80b2';
  }
  
  getVertexShader() {
    return this.source;
  }
  
  getFragmentShader() {
    return this.source;
  }
  
  // 创建Cesium CustomShader配置
  toCesiumShader(uniformValues = {}) {
    const uniforms = {};
    this.uniforms.forEach(u => {
      uniforms[u.name] = {
        value: uniformValues[u.name] || this.parseDefaultValue(u.defaultValue),
        type: this.mapGlslTypeToCesium(u.type)
      };
    });
    
    return {
      vertexShaderText: this.source,
      fragmentShaderText: this.source,
      uniforms
    };
  }
  
  parseDefaultValue(defaultValue) {
    if (!defaultValue) return null;
    // 这里可以添加类型解析逻辑
    return defaultValue;
  }
  
  mapGlslTypeToCesium(glslType) {
    const typeMap = {
      'float': 'FLOAT',
      'vec2': 'VEC2',
      'vec3': 'VEC3',
      'vec4': 'VEC4',
      'mat4': 'MAT4',
      'sampler2D': 'SAMPLER_2D'
    };
    return typeMap[glslType] || 'FLOAT';
  }
}

export default VOLUMECLOUDEFFECT_SOURCE;