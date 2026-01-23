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
#define sphereRadius 10000.
#define sphereCenter vec3(-1635117.0284874607, 5477987.653236552, 2826439.5398477674)
#define iTime czm_frameNumber/360. 
#define ABSORPTION_COEFFICIENT 0.9
#define SCATTERING_ANISO 0.3

float noise(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  vec2 uv = mod(p.xy + vec2(37.0, 239.0) * p.z, 256.0) + f.xy;

  vec2 tex = textureLod(iChannel2, (uv + 0.5) / 256.0, 0.0).yx;

  return mix(tex.x, tex.y, f.z) * 2.0 - 1.0;
}

vec2 raySphereDst(vec3 rayOrigin, vec3 rayDir) {
  vec3 oc = rayOrigin - sphereCenter;
  float b = dot(rayDir, oc);
  float c = dot(oc, oc) - sphereRadius * sphereRadius;
  float t = b * b - c; // t > 0有两个交点, = 0 相切， < 0 不相交

  float delta = sqrt(max(t, 0.0));
  float dstToSphere = max(-b - delta, 0.0);
  float dstInSphere = max(-b + delta - dstToSphere, 0.0);
  return vec2(dstToSphere, dstInSphere);
}

float sdSphere(vec3 p, float radius) {
  return length(p) - radius;
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

float scene(vec3 p, bool useSun) {
  vec3 sunDirection = normalize(czm_sunDirectionWC);
  float distance = sdSphere(p, sphereRadius) / sphereRadius;

  float sun = czm_branchFreeTernary(useSun, 0., 1.);
  float f = fbm(p / sphereRadius + sun * 0.3 * sunDirection);

  return -distance + f;
}

vec4 raymarch(vec3 rayOrigin, vec3 rayDirection, float offset) {
  vec2 distToSphere = raySphereDst(rayOrigin, rayDirection);
  float MARCH_SIZE = distToSphere.y / float(MAX_STEPS * 2);

  float depth = 0.;
  depth += MARCH_SIZE * offset;
  vec3 startPos = rayOrigin + rayDirection * distToSphere.x;
  vec3 p = startPos;

  vec4 res = vec4(0.0);
  if(distToSphere.y <= 0.)
    return vec4(0.);

  for(int i = 0; i < MAX_STEPS; i++) {
    // 归一化中心
    p = p - sphereCenter;
    float density = scene(p, false);

    if(density > 0.0) {
      float diffuse = clamp((scene(p, false) - scene(p, true)) / 0.3, 0.0, 1.0);
      vec3 lin = vec3(0.60, 0.60, 0.75) * 1.1 + 0.8 * vec3(1.0, 0.6, 0.3) * diffuse;
      vec4 color = vec4(mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), density), density);
      color.rgb *= lin;
      color.rgb *= color.a;
      res += color * (1.0 - res.a);
    }

    depth += MARCH_SIZE;
    p = startPos + rayDirection * depth;
  }

  return res;
}

void main() {
    // 获取几何数据
  geometry = getGeometryData();

  vec3 ro = czm_viewerPositionWC;
  vec3 rd = normalize(geometry.positionWC - czm_viewerPositionWC);
  vec3 color = vec3(0.);

  vec3 sunDirection = normalize(czm_sunDirectionWC);
  float sun = clamp(dot(sunDirection, rd), 0.0, 1.0);
  // color -= 0.8 * vec3(0.90, 0.75, 0.90) * rd.y;
  color += 0.5 * vec3(1.0, 0.5, 0.3) * pow(sun, 10.0);

  float blueNoise = texture(blueNoise, gl_FragCoord.xy / 512.0).r;
  float offset = fract(blueNoise + mod(czm_frameNumber, 32.) / sqrt(0.5));

  vec4 res = raymarch(ro, rd, offset);
  color = color * (1.0 - res.a) + res.rgb;

  out_FragColor = vec4(mix(geometry.sceneColor.rgb, color, res.a), 1.);

}