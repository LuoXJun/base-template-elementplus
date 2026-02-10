// Auto-generated from volumeCloudEffect.glsl
// Hash: cb44bcaf
// Generated at: 罗君

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
  vec4 sceneColor;//场景颜色
};
#include <post_getGeometryData>
PostGeometryData geometry;

uniform sampler2D iChannel2;
uniform sampler2D blueNoise;

// 基本定义 
#define MAX_STEPS 64
#define MAX_STEPS_LIGHTS 10
#define earthRadius longR
#define iTime czm_frameNumber/120. 
#define ABSORPTION_COEFFICIENT 0.9
#define SCATTERING_ANISO 0.3
#define minCloudHeight 30000.
#define maxCloudHeight 35000.
#define CLOUDS_THICKNESS maxCloudHeight - minCloudHeight
#define _BlueNoiseCoords vec4(512.,512.,258.,258.)

//射线与球体相交, x 到球体最近的距离， y 穿过球体的距离
//原理是将射线方程(x = o + dl)带入球面方程求解(|x - c|^2 = r^2)
vec2 raySphereDst(vec3 earthCenter, float radius, vec3 rayOrigin, vec3 rayDir) {
  vec3 oc = rayOrigin - earthCenter;//earthCenter
  float b = dot(rayDir, oc);
  float c = dot(oc, oc) - radius * radius;
  float t = b * b - c; // t > 0有两个交点, = 0 相切， < 0 不相交

  float delta = sqrt(max(t, 0.0));
  float dstToSphere = max(-b - delta, 0.0);
  float dstInSphere = max(-b + delta - dstToSphere, 0.0);
  return vec2(dstToSphere, dstInSphere);
}

/*
		计算相机发出的射线与云层范围的相交情况
		返回值：
			dstToCloudLayer  到云层的最近距离
			dstInCloudLayer  在云层中穿过的距离
	*/
vec2 rayCloudLayerDst(vec3 earthCenter, vec3 rayOrigin, vec3 rayDir) {

  vec2 cloudDstMin = raySphereDst(earthCenter, minCloudHeight + earthRadius, rayOrigin, rayDir);
  vec2 cloudDstMax = raySphereDst(earthCenter, maxCloudHeight + earthRadius, rayOrigin, rayDir);

		// 射线到云层的最近距离
  float dstToCloudLayer = 0.0;
		// 射线穿过云层的距离
  float dstInCloudLayer = 0.0;
  float d = distance(rayOrigin, earthCenter);
    // 在地表上
  if(d <= minCloudHeight + earthRadius) {
    vec3 startPos = rayOrigin + rayDir * cloudDstMin.y;
    if(wgs84_getHeight(startPos) >= 0.) {
      dstToCloudLayer = cloudDstMin.y;
      dstInCloudLayer = cloudDstMax.y - cloudDstMin.y;
    }
    return vec2(dstToCloudLayer, dstInCloudLayer);
  }

		// 在云层内
  else if(d > minCloudHeight + earthRadius && d <= maxCloudHeight + earthRadius) {
    dstToCloudLayer = 0.;
    dstInCloudLayer = cloudDstMin.y > 0. ? cloudDstMin.x : cloudDstMax.y;
    return vec2(dstToCloudLayer, dstInCloudLayer);
  }

		// 在云层外
  else {
    dstToCloudLayer = cloudDstMax.x;
    dstInCloudLayer = cloudDstMin.y > 0. ? cloudDstMin.x - dstToCloudLayer : cloudDstMax.y;
  }
  return vec2(dstToCloudLayer, dstInCloudLayer);
}

// 
#define ABSORPTION 5.e-5
#define SCATTERING 7.e-4
#define UINT_MAX float(0xffffffffu)
#define CLOUDS_SCALE 0.1e-3
#define CLOUDS_SPEED vec3(0.25, 0.037, 0.0)*0.5
#define CLOUD_SMOOTHNESS 0.65
#define CLOUD_COVERAGE 0.9
#define DENSITY 1.

uint hashPCGu(uint x) {
  uint state = x * 747796405u + 2891336453u;
  uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}
float hashPCG(vec2 x) {
  x += 3250000.;
  x = abs(x);
  uvec2 p = uvec2(floor(x));
  return float(hashPCGu(149u * p.x ^ 233u * p.y)) / UINT_MAX;
    //return float(hashPCGu(p.x + hashPCGu(p.y))) / UINT_MAX;
}
float hashPCG(vec3 x) {
  x += 3250000.;
  x = abs(x);
  uvec3 p = uvec3(floor(x));
  return float(hashPCGu(149u * p.x ^ 233u * p.y ^ 157u * p.z)) / UINT_MAX;
}
float vnoise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  return mix(mix(mix(hashPCG(i + vec3(0, 0, 0)), hashPCG(i + vec3(1, 0, 0)), f.x), mix(hashPCG(i + vec3(0, 1, 0)), hashPCG(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(hashPCG(i + vec3(0, 0, 1)), hashPCG(i + vec3(1, 0, 1)), f.x), mix(hashPCG(i + vec3(0, 1, 1)), hashPCG(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

float fbmCloud(vec3 p) {
  p = CLOUDS_SCALE * p + iTime * CLOUDS_SPEED;
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

  t *= 0.4;

  float cov = 0.6 - 0.35 * CLOUD_COVERAGE;

  t *= smoothstep(cov, cov + 0.05, t);
    //t = clamp(t, 0.0, 1.0);

  return t * DENSITY;
}

void main() {
    // 获取几何数据
  geometry = getGeometryData();

  vec3 ro = czm_viewerPositionWC;
  vec3 rd = normalize(geometry.positionWC - czm_viewerPositionWC);
  vec3 color = vec3(1.);

  vec2 distToSphere = rayCloudLayerDst(vec3(0.), ro, rd);
  float distanceToCloud = distance(geometry.positionWC, ro);
  if(distToSphere.y <= 0. || distanceToCloud <= distToSphere.x) {

    out_FragColor = geometry.sceneColor;
    return;
  }

  float stepLength = distToSphere.y / float(MAX_STEPS * 2);

// 采用蓝噪音偏移，保证减少步进次数后的渲染效果
  // float blueNoise = texture(blueNoise, v_textureCoordinates * _BlueNoiseCoords.xy + _BlueNoiseCoords.zw).r;
  // stepLength *= blueNoise * 1.2;

  float tCurrent = distToSphere.x;

  // 随机偏移射线起点以减少带状伪影
  // tCurrent += stepLength * (hashPCG(v_textureCoordinates) * 2.0 - 1.0);

  float tmax = distToSphere.x + distToSphere.y;
  float totalDensity = 0.;

  while(tCurrent < tmax) {

    vec3 samplePosition = ro + tCurrent * rd;
    float density = fbmCloud(samplePosition);

    tCurrent += stepLength;
    totalDensity += density;

    if(totalDensity >= 1.)
      break;

  }

  out_FragColor = vec4(mix(geometry.sceneColor.rgb, color, totalDensity), 1.);

}
`;

// Uniform 信息
export const VOLUMECLOUDEFFECT_UNIFORMS = [
  {
    "type": "sampler2D",
    "name": "iChannel2"
  },
  {
    "type": "sampler2D",
    "name": "blueNoise"
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
    this.hash = 'cb44bcaf';
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