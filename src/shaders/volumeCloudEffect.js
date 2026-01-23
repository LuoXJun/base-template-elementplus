// Auto-generated from volumeCloudEffect.glsl
// Hash: 2a400c30
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
#define MAX_STEPS 100
#define MAX_STEPS_LIGHTS 10
#define earthRadius longR
#define sphereCenter vec3(-1635117.0284874607, 5477987.653236552, 2826439.5398477674)
#define iTime czm_frameNumber/360. 
#define ABSORPTION_COEFFICIENT 0.9
#define SCATTERING_ANISO 0.3
#define minCloudHeight 8000.
#define maxCloudHeight 10000.

float noise(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  vec2 uv = mod(p.xy + vec2(37.0, 239.0) * p.z, 256.0) + f.xy;

  vec2 tex = textureLod(iChannel2, (uv + 0.5) / 256.0, 0.0).yx;

  return mix(tex.x, tex.y, f.z) * 2.0 - 1.0;
}

vec2 raySphereDst(float radius, vec3 rayOrigin, vec3 rayDir) {
  vec3 oc = rayOrigin;
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
vec2 rayCloudLayerDst(vec3 rayOrigin, vec3 rayDir) {

  vec2 cloudDstMin = raySphereDst(minCloudHeight + earthRadius, rayOrigin, rayDir);
  vec2 cloudDstMax = raySphereDst(maxCloudHeight + earthRadius, rayOrigin, rayDir);

  float cameraHeight = wgs84_getHeight(rayOrigin);

		// 射线到云层的最近距离
  float dstToCloudLayer = 0.0;
		// 射线穿过云层的距离
  float dstInCloudLayer = 0.0;
    // 在地表上
  if(cameraHeight <= minCloudHeight) {
    dstToCloudLayer = cloudDstMin.y;
    dstInCloudLayer = cloudDstMax.y - cloudDstMin.y;
    return vec2(dstToCloudLayer, dstInCloudLayer);
  }

		// 在云层内
  if(cameraHeight > minCloudHeight && cameraHeight <= maxCloudHeight) {
    dstToCloudLayer = 0.0;
    dstInCloudLayer = cloudDstMin.y > 0.0 ? cloudDstMin.x : cloudDstMax.y;
    return vec2(dstToCloudLayer, dstInCloudLayer);
  }

		// 在云层外
  dstToCloudLayer = cloudDstMax.x;
  dstInCloudLayer = cloudDstMin.y > 0.0 ? cloudDstMin.x - dstToCloudLayer : cloudDstMax.y;

  return vec2(dstToCloudLayer, dstInCloudLayer);
}

float sdSphere(vec3 p, float innerRadius, float outerRadius) {
  float d = length(p);

    // 方法1：绝对值法（类似圆环的扩展）
    // 计算到中间距离，然后减去一半厚度
  float mid_radius = (innerRadius + outerRadius) * 0.5;
  float half_thickness = (outerRadius - innerRadius) * 0.5;

  return abs(d - mid_radius) - half_thickness;

}

float fbm(vec3 p) {
  vec3 q = p + iTime * 0.5 * vec3(1., -0.2, -1.);
  float f = 0.0;
  float scale = 0.5;
  float factor = 2.02;

  for(int i = 0; i < 3; i++) {
    f += scale * noise(q);
    q *= factor;
    factor += 0.21;
    scale *= 0.5;
  }

  return f;
}

float scene(vec3 p) {
  float distance = sdSphere(p, earthRadius + minCloudHeight, earthRadius + maxCloudHeight);

  return distance;
}

float raymarch(vec3 rayOrigin, vec3 rayDirection, float offset) {
  vec2 distToSphere = rayCloudLayerDst(rayOrigin, rayDirection);
  float MARCH_SIZE = distToSphere.y / float(MAX_STEPS * 2);

  float depth = 0.;
  depth += MARCH_SIZE * offset;
  vec3 startPos = rayOrigin + rayDirection * distToSphere.x;

  if(distToSphere.y <= 0.)
    return 0.;

  for(int i = 0; i < MAX_STEPS; i++) {
    vec3 p = startPos + rayDirection * depth;
    float dist = scene(p);

    if(dist < 0.001) {
      return depth;
    }

    depth += dist;

    if(depth >= distToSphere.y) {
      break;
    }
  }

}

const mat3 m3 = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
const mat3 m3i = mat3(0.00, -0.80, -0.60, 0.80, 0.36, -0.48, 0.60, -0.48, 0.64);
float hash1(float n) {
  return fract(n * 17.0 * fract(n * 0.3183099));
}
vec4 noised(in vec3 x) {
  vec3 p = floor(x);
  vec3 w = fract(x);
    #if 1
  vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
  vec3 du = 30.0 * w * w * (w * (w - 2.0) + 1.0);
    #else
  vec3 u = w * w * (3.0 - 2.0 * w);
  vec3 du = 6.0 * w * (1.0 - w);
    #endif

  float n = p.x + 317.0 * p.y + 157.0 * p.z;

  float a = hash1(n + 0.0);
  float b = hash1(n + 1.0);
  float c = hash1(n + 317.0);
  float d = hash1(n + 318.0);
  float e = hash1(n + 157.0);
  float f = hash1(n + 158.0);
  float g = hash1(n + 474.0);
  float h = hash1(n + 475.0);

  float k0 = a;
  float k1 = b - a;
  float k2 = c - a;
  float k3 = e - a;
  float k4 = a - b - c + d;
  float k5 = a - c - e + g;
  float k6 = a - b - e + f;
  float k7 = -a + b + c - d + e - f - g + h;

  return vec4(-1.0 + 2.0 * (k0 + k1 * u.x + k2 * u.y + k3 * u.z + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z), 2.0 * du * vec3(k1 + k4 * u.y + k6 * u.z + k7 * u.y * u.z, k2 + k5 * u.z + k4 * u.x + k7 * u.z * u.x, k3 + k6 * u.x + k5 * u.y + k7 * u.x * u.y));
}
vec4 fbmd_8(in vec3 x) {
  float f = 2.0;
  float s = 0.65;
  float a = 0.0;
  float b = 0.5;
  vec3 d = vec3(0.0);
  mat3 m = mat3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);
  for(int i = ZERO; i < 8; i++) {
    vec4 n = noised(x);
    a += b * n.x;          // accumulate values		
    if(i < 4)
      d += b * m * n.yzw;      // accumulate derivatives
    b *= s;
    x = f * m3 * x;
    m = f * m3i * m;
  }
  return vec4(a, d);
}
vec4 cloudsFbm(in vec3 pos) {
  return fbmd_8(pos * 0.0015 + vec3(2.0, 1.1, 1.0) + 0.07 * vec3(iTime, 0.5 * iTime, -0.15 * iTime));
}
vec4 cloudsMap(in vec3 pos, out float nnd) {
  float d = abs(wgs84_getHeight(pos) - earthRadius - maxCloudHeight) - minCloudHeight;
  vec3 gra = vec3(0.0, sign(pos.y - 900.0), 0.0);

  vec4 n = cloudsFbm(pos);
  d += 400.0 * n.x * (0.7 + 0.3 * gra.y);

  if(d > 0.0)
    return vec4(-d, 0.0, 0.0, 0.0);

  nnd = -d;
  d = min(-d / 100.0, 0.25);

    //gra += 0.1*n.yzw *  (0.7+0.3*gra.y);

  return vec4(d, gra);
}
vec4 renderClouds(in vec3 ro, in vec3 rd) {
  vec2 distToSphere = rayCloudLayerDst(ro, rd);

  vec4 sum = vec4(0.0);

  float tmax = distToSphere.y;
  // if(tmax <= 0.)
  //   return sum;

  float t = distToSphere.x;
  float lastT = -1.0;
  float thickness = 0.0;
  vec3 startPos = ro + rd * t;

  for(int i = ZERO; i < 128; i++) {
    vec3 pos = startPos;
    float nnd;
    vec4 denGra = cloudsMap(pos, nnd);
    float den = denGra.x;
    float dt = max(0.2, 0.011 * t);
    if(den > 0.001) {
      float kk;
      float sha = 1.0 - smoothstep(-200.0, 200.0, kk);
      sha *= 1.5;

            // color
      vec3 col = vec3(0.8, 0.8, 0.8) * 0.45;

            // front to back blending    
      float alp = clamp(den * 0.5 * 0.125 * dt, 0.0, 1.0);
      col.rgb *= alp;
      sum = sum + vec4(col, alp) * (1.0 - sum.a);

      thickness += dt * den;
      if(lastT < 0.0)
        lastT = t;
    } else {
      dt = abs(den) + 0.2;

    }
    t += dt;
    if(sum.a > 0.995 || t > tmax)
      break;
  }

  sum.xyz += max(0.0, 1.0 - 0.0125 * thickness) * vec3(1.00, 0.60, 0.40) * 0.3;

  return clamp(sum, 0.0, 1.0);
}

void main() {
    // 获取几何数据
  geometry = getGeometryData();

  vec3 ro = czm_viewerPositionWC;
  vec3 rd = normalize(geometry.positionWC - czm_viewerPositionWC);
  vec3 color = vec3(0.);
  vec3 sunDirection = normalize(czm_sunDirectionWC);

  vec4 res = renderClouds(ro, rd);

  vec2 distToSphere = rayCloudLayerDst(ro, rd);

  out_FragColor = vec4(mix(geometry.sceneColor.rgb, color, res.a), 1.);
  // if(res < distToSphere.y) {
  //   out_FragColor = vec4(vec3(0.), 1.);
  // } else {
  //   out_FragColor = geometry.sceneColor;
  // }

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
    this.hash = '2a400c30';
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