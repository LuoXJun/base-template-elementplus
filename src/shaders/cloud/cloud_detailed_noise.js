// Auto-generated from cloud_detailed_noise.glsl
// Hash: 2d071c9f
// Generated at: 罗君

const CLOUD_DETAILED_NOISE_SOURCE = `
#version 460
#extension GL_GOOGLE_include_directive : enable

#include <cloud_noise_common>

// Detail frequency is 8.0f
#define kDetailFrequency 8.0

layout(set = 0, binding = 0, r8) uniform image3D imageWorleyNoise;
layout(local_size_x = 8, local_size_y = 8, local_size_z = 1) in;
void main() {
    ivec3 texSize = imageSize(imageWorleyNoise);
    ivec3 workPos = ivec3(gl_GlobalInvocationID.xyz);

    if(workPos.x >= texSize.x || workPos.y >= texSize.y || workPos.z >= texSize.z) {
        return;
    }

    const vec3 uvw = (vec3(workPos) + vec3(0.5)) / vec3(texSize);

    float detailNoise = worleyFbm(uvw, kDetailFrequency * 1.0) * 0.625 +
        worleyFbm(uvw, kDetailFrequency * 2.0) * 0.250 +
        worleyFbm(uvw, kDetailFrequency * 4.0) * 0.125;

    imageStore(imageWorleyNoise, workPos, vec4(detailNoise));
}
`;

// Uniform 信息
export const CLOUD_DETAILED_NOISE_UNIFORMS = [
  {
    "type": "image3D",
    "name": "imageWorleyNoise"
  }
];

// Attribute 信息
export const CLOUD_DETAILED_NOISE_ATTRIBUTES = [];

// Shader 类
export class CloudDetailedNoiseShader {
  constructor() {
    this.source = CLOUD_DETAILED_NOISE_SOURCE;
    this.uniforms = CLOUD_DETAILED_NOISE_UNIFORMS;
    this.attributes = CLOUD_DETAILED_NOISE_ATTRIBUTES;
    this.hash = '2d071c9f';
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

export default CLOUD_DETAILED_NOISE_SOURCE;