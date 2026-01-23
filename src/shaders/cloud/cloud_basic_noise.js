// Auto-generated from cloud_basic_noise.glsl
// Hash: 114b28cc
// Generated at: 罗君

const CLOUD_BASIC_NOISE_SOURCE = `
#version 460
#extension GL_GOOGLE_include_directive : enable

#include <cloud_noise_common>

#define kBasicFrequency 4.0
#define kBasicNoiseMixFactor 0.5

layout(set = 0, binding = 0, r8) uniform image3D imageBasicNoise;

float remap(float x, float a, float b, float c, float d) {
    return (((x - a) / (b - a)) * (d - c)) + c;
}

float basicNoiseComposite(vec4 v) {
    float wfbm = v.y * 0.625 + v.z * 0.25 + v.w * 0.125; 

    // cloud shape modeled after the GPU Pro 7 chapter
    return remap(v.x, wfbm - 1.0, 1.0, 0.0, 1.0);
}

layout(local_size_x = 8, local_size_y = 8, local_size_z = 1) in;
void main() {
    ivec3 texSize = imageSize(imageBasicNoise);
    ivec3 workPos = ivec3(gl_GlobalInvocationID.xyz);

    if(workPos.x >= texSize.x || workPos.y >= texSize.y || workPos.z >= texSize.z) {
        return;
    }

    const vec3 uvw = (vec3(workPos) + vec3(0.5)) / vec3(texSize);

    float pfbm = mix(1.0, perlinfbm(uvw, kBasicFrequency, 7), kBasicNoiseMixFactor);
    pfbm = abs(pfbm * 2.0 - 1.0); // billowy perlin noise

    vec4 col = vec4(0.0);
    col.g += worleyFbm(uvw, kBasicFrequency * 1.0);
    col.b += worleyFbm(uvw, kBasicFrequency * 2.0);
    col.a += worleyFbm(uvw, kBasicFrequency * 4.0);

    col.r += remap(pfbm, 0., 1., col.g, 1.0); // perlin-worley
    imageStore(imageBasicNoise, workPos, vec4(basicNoiseComposite(col)));
}
`;

// Uniform 信息
export const CLOUD_BASIC_NOISE_UNIFORMS = [
  {
    "type": "image3D",
    "name": "imageBasicNoise"
  }
];

// Attribute 信息
export const CLOUD_BASIC_NOISE_ATTRIBUTES = [];

// Shader 类
export class CloudBasicNoiseShader {
  constructor() {
    this.source = CLOUD_BASIC_NOISE_SOURCE;
    this.uniforms = CLOUD_BASIC_NOISE_UNIFORMS;
    this.attributes = CLOUD_BASIC_NOISE_ATTRIBUTES;
    this.hash = '114b28cc';
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

export default CLOUD_BASIC_NOISE_SOURCE;