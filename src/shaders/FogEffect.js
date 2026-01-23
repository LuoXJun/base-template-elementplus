// Auto-generated from FogEffect.glsl
// Hash: 71bb89a7
// Generated at: 罗君

const FOGEFFECT_SOURCE = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

uniform float u_fogHeight;
uniform float u_globalDensity;
uniform vec4 fogColor;

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

vec4 getWorldCoordinate(sampler2D depthTexture, vec2 texCoords) {
    float depthOrLogDepth = czm_unpackDepth(texture(depthTexture, texCoords));
    vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depthOrLogDepth);
    eyeCoordinate = eyeCoordinate / eyeCoordinate.w;
    vec4 worldCoordinate = czm_inverseView * eyeCoordinate;
    worldCoordinate = worldCoordinate / worldCoordinate.w;
    return worldCoordinate;
}

float projectVector(vec3 a, vec3 b) {
    float scale = dot(a, b) / dot(b, b);
    float k = scale / abs(scale);
    return k * length(scale * b);
}

float linearHeightFog(vec3 positionToCamera, float cameraHeight, float pixelHeight, float fogMaxHeight) {
    float globalDensity = u_globalDensity / 10.0;
    vec3 up = -1.0 * normalize(czm_viewerPositionWC);
    float vh = projectVector(normalize(positionToCamera), up);

  // 让相机沿着视线方向移动 雾气产生距离 的距离
    float s = step(100.0, length(positionToCamera));
    vec3 sub = mix(positionToCamera, normalize(positionToCamera) * 100.0, s);
    positionToCamera -= sub;
    cameraHeight = mix(pixelHeight, cameraHeight - 100.0 * vh, s);

    float b = mix(cameraHeight, fogMaxHeight, step(fogMaxHeight, cameraHeight));
    float a = mix(pixelHeight, fogMaxHeight, step(fogMaxHeight, pixelHeight));

    float fog = (b - a) - 0.5 * (pow(b, 2.0) - pow(a, 2.0)) / fogMaxHeight;
    fog = globalDensity * fog / vh;

    if(abs(vh) <= 0.01 && cameraHeight < fogMaxHeight) {
        float disToCamera = length(positionToCamera);
        fog = globalDensity * (1.0 - cameraHeight / fogMaxHeight) * disToCamera;
    }

    fog = mix(0.0, 1.0, fog / (fog + 1.0));

    return fog;
}
void main() {
    geometry = getGeometryData();

    vec4 color = texture(colorTexture, v_textureCoordinates);
    vec3 positionWC = geometry.positionWC;
    float pixelHeight = geometry.height;
    vec3 positionToCamera = vec3(positionWC - czm_viewerPositionWC);
    float fog = linearHeightFog(positionToCamera, czm_eyeHeight, pixelHeight, u_fogHeight);

    out_FragColor = czm_branchFreeTernary(czm_eyeHeight > 100000., color, mix(color, fogColor, fog));

}

`;

// Uniform 信息
export const FOGEFFECT_UNIFORMS = [
  {
    "type": "float",
    "name": "u_fogHeight"
  },
  {
    "type": "float",
    "name": "u_globalDensity"
  },
  {
    "type": "vec4",
    "name": "fogColor"
  }
];

// Attribute 信息
export const FOGEFFECT_ATTRIBUTES = [];

// Shader 类
export class FogEffectShader {
  constructor() {
    this.source = FOGEFFECT_SOURCE;
    this.uniforms = FOGEFFECT_UNIFORMS;
    this.attributes = FOGEFFECT_ATTRIBUTES;
    this.hash = '71bb89a7';
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

export default FOGEFFECT_SOURCE;