// Auto-generated from volumeCloudEffect copy 2.glsl
// Hash: 99dfd944
// Generated at: 罗君

const VOLUMECLOUDEFFECT COPY 2_SOURCE = `
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

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel3;
uniform sampler2D iChannel4;
uniform sampler2D blueNoise;

// 基本定义 
#define PARAMS_LINEAR_RAMP  vec2(0.00, 0.00)
#define PARAMS_CUMULUS      vec2(0.4, 0.6)
#define PARAMS_CUMULONIMBUS vec2(0.70, 0.98)
#define SCALE 1000.0
#define OFFSET vec2(4.0, 8.0)
#define SHAPE PARAMS_CUMULUS
#define PLANET_CENTER vec3(0.)
#define PLANET_RADIUS longR
#define CLOUD_COVERAGE 0.3 // Fixed cloud coverage
//#define CLOUD_COVERAGE (0.35 - sin(iTime * 0.02 + 3.1415) * 0.2) // Animated cloud coverage
#define CLOUD_DENSITY 1.0
#define CLOUD_PLANE_BOT 8000.0
#define CLOUD_PLANE_TOP 13000.0
#define iTime czm_frameNumber/120.
#define TEMPORAL_ACCUMULATION_CLOUDS 0.85

float sq(float x) {
  return x * x;
}
float PhaseR(float costh) {
  return (1.0 + sq(costh)) * 0.06;
}
float PhaseM(float costh, float g) {
  g = min(g, 0.9381);
  float k = 1.55 * g - 0.55 * sq(g) * g;
  float a = 1.0 - sq(k);
  float b = 12.57 * sq(1.0 - k * costh);
  return a / b;
}

float saturate(float x) {
  return clamp(x, 0., 1.);
}
float Noise(vec2 x) {
  return textureLod(iChannel0, x * 0.002, 0.0).x;
}
float CloudShape(float x, float y, vec2 shapeParams) {
  shapeParams.x *= shapeParams.y;
  shapeParams.y = 1.0 / (1.0 - shapeParams.y);
  float anvil = 1.0 - sq(abs(y - 0.5) * 2.0);
  return saturate(x - anvil * shapeParams.x - pow(y, shapeParams.y));
}
float remap01(float x, float a, float b) {
  return clamp((x - a) / (b - a), 0.0, 1.0);
}

float Height(vec3 p) {
  return length(p - PLANET_CENTER) - PLANET_RADIUS;
}

float Cloud(vec3 p) {
  vec2 wind = vec2(0, iTime);
  float y = (Height(p) - CLOUD_PLANE_BOT) / (CLOUD_PLANE_TOP - CLOUD_PLANE_BOT);
  const float scale = 1.0 / SCALE;
  float n = Noise(p.xz * scale + OFFSET + vec2(-0.2, 0.3) * iTime);
  float d = CloudShape(n - 1.0 + CLOUD_COVERAGE * 2.0, y, SHAPE);

  float n2 = Noise(p.xz * scale * 8.0 - vec2(0.2, 0.0) * iTime);
  float n3 = Noise(p.xz * scale * 40.0 + vec2(1.0, 0.0) * iTime);

  d = remap01(d, (1.0 - n2) * 0.3, 1.0);
  d = remap01(d, (1.0 - n3) * 0.1, 1.0);

  d *= smoothstep(0.0, 0.75, y);

  return sq(d) * CLOUD_DENSITY;
}

vec3 Lum(vec3 p, vec3 ld, float costh, float ext, float dither) {
  float le = 0.0;
  float ae = 0.0;
  int sc = 4;
  float ss = (CLOUD_PLANE_TOP - CLOUD_PLANE_BOT) / float(sc);
  for(int j = 0; j < sc; j++) {
    vec3 lp = p + ld * (float(j) + dither) * ss;
    le += Cloud(lp) * ss;
  }
  sc = 2;
  for(int j = 0; j < sc; j++) {
    vec3 lp = p + vec3(0, 1, 0) * (float(j) + dither) * ss;
    ae += Cloud(lp) * ss;
  }
  float single = exp(-le) * PhaseM(costh, 0.85);
  float multi = exp(-le * 0.05) * PhaseR(costh);
  multi *= 1.0 - exp(-ext * 6e2);
  return vec3(single + multi, (exp(-ae) + exp(-ae * 0.05)) * 0.5, 0);
}

vec2 SphereIntersection(vec3 rayStart, vec3 rayDir, vec3 sphereCenter, float sphereRadius) {
  vec3 oc = rayStart - sphereCenter;
  float b = dot(oc, rayDir);
  float c = dot(oc, oc) - sq(sphereRadius);
  float h = sq(b) - c;
  if(h < 0.0) {
    return vec2(-1.0, -1.0);
  } else {
    h = sqrt(h);
    return vec2(-b - h, -b + h);
  }
}
vec2 PlanetIntersection(vec3 rayStart, vec3 rayDir) {
  return SphereIntersection(rayStart, rayDir, PLANET_CENTER, PLANET_RADIUS);
}

void main() {
    // 获取几何数据
  geometry = getGeometryData();

  vec3 ro = czm_viewerPositionWC;
  vec3 rd = normalize(geometry.positionWC - czm_viewerPositionWC);

  vec3 dither = textureLod(iChannel1, gl_FragCoord.xy / vec2(1024.), 0.0).xyz;
  dither = fract(dither + (0.61803398875 * mod(czm_frameNumber, 256.)));

  vec3 sunPos = czm_sunPositionWC;
  vec3 sunDir = czm_sunDirectionWC;

  float costh = dot(rd, sunDir);

  vec2 t1 = SphereIntersection(ro, rd, PLANET_CENTER, PLANET_RADIUS + CLOUD_PLANE_BOT);
  vec2 t2 = SphereIntersection(ro, rd, PLANET_CENTER, PLANET_RADIUS + CLOUD_PLANE_TOP);
  vec2 tp = PlanetIntersection(ro, rd);

  float enter = t1.y;
  float exit = t2.y;
  if(t1.x > 0.0) {
    exit = t1.x;
  }
  if(t2.x > 0.0) {
    enter = t2.x;
  }
  if(length(ro) > CLOUD_PLANE_BOT && length(ro) < CLOUD_PLANE_TOP) {
    enter = 0.0;
  }
  if(tp.x > 0.0) {
    enter = min(enter, tp.x);
    exit = min(exit, tp.x);
  }

  enter = max(0.0, enter);

  float depth = 0.0;

  vec3 s = vec3(0.0);
  float tsm = 1.0;
  int sc = 64;
  float ss = 100.0;
  float t = enter + ss * 0.5;
  for(int i = 0; i < sc; i++) {
    vec3 p = ro + rd * (t + ss * dither.x);

    float h = Height(p);
    if(h < CLOUD_PLANE_BOT || h > CLOUD_PLANE_TOP) {
      break;
    }

    float le = Cloud(p);
    vec3 ll = vec3(0.0);
    if(le > 0.0) {
      ll = Lum(p, sunDir, costh, le, dither.y);
      vec4 at;
    }

    float lt = exp(-le * ss);
    float is = tsm * (1.0 - lt);

    depth = mix(depth, t, sq(tsm));

    s += ll * is;
    tsm *= lt;

    if(tsm < 1e-5) {
      break;
    }

    t += ss;
    ss *= 1.05;

    if(t > exit) {
      break;
    }
  }

  vec4 prev = vec4(1.);//texture(iChannel2, uv);

  float temporalStability = TEMPORAL_ACCUMULATION_CLOUDS;
    // Doesn't work for some reason
  float screenHash = czm_viewport.z + czm_viewport.w;
  float sunHash = sunPos.x + sunPos.y;
    // Doesn't work for some reason
    //temporalStability = GetTemporalStability(iFrame, sunHash, sunHashPrev, TEMPORAL_ACCUMULATION_CLOUDS, 50.0);

    // vec4(direct, ambient, alpha, weighted depth)
  vec4 fragColor = max(geometry.sceneColor, mix(vec4(s.xy / (1.0 - tsm), 1.0 - tsm, depth), prev, temporalStability));

  if(gl_FragCoord.x < 1.0 && gl_FragCoord.y < 1.0) {
        // Store some data in corner pixel
    fragColor.z = screenHash;
    fragColor.w = sunHash;
  }

  out_FragColor = fragColor;
}
`;

// Uniform 信息
export const VOLUMECLOUDEFFECT COPY 2_UNIFORMS = [
  {
    "type": "sampler2D",
    "name": "iChannel0"
  },
  {
    "type": "sampler2D",
    "name": "iChannel1"
  },
  {
    "type": "sampler2D",
    "name": "iChannel3"
  },
  {
    "type": "sampler2D",
    "name": "iChannel4"
  },
  {
    "type": "sampler2D",
    "name": "blueNoise"
  }
];

// Attribute 信息
export const VOLUMECLOUDEFFECT COPY 2_ATTRIBUTES = [];

// Shader 类
export class VolumeCloudEffect copy 2Shader {
  constructor() {
    this.source = VOLUMECLOUDEFFECT COPY 2_SOURCE;
    this.uniforms = VOLUMECLOUDEFFECT COPY 2_UNIFORMS;
    this.attributes = VOLUMECLOUDEFFECT COPY 2_ATTRIBUTES;
    this.hash = '99dfd944';
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

export default VOLUMECLOUDEFFECT COPY 2_SOURCE;