// Auto-generated from FlowlineEffect.glsl
// Hash: c5f81d85
// Generated at: 2026-01-14T01:32:31.613Z

const FLOWLINEEFFECT_SOURCE = `
uniform vec4 color;
uniform float speed;
uniform float glowPower;
uniform float lineCount;

czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;

    // 将整个线条分成多个小段
    float segment = st.s * lineCount;
    float segmentFraction = fract(segment);
    int segmentIndex = int(floor(segment));

    // 每个小段有独立的流动时间
    float segmentTime = fract(czm_frameNumber / 120.0 * speed + float(segmentIndex) * 0.3);

    // 每个小段内的流动效果
    float flow = fract(segmentFraction + (1.0 - segmentTime));

    // 计算辉光效果
    float glow = 0.0;

    // 方式B：脉冲式流动效果（可选）
    glow = exp(-10.0 * abs(flow - 0.5)) * 1.5;

    material.diffuse = color.rgb;
    material.alpha = color.a * (0.2 + glow * glowPower);
    material.emission = color.rgb * glow * glowPower;

    return material;
}
`;

// Uniform 信息
export const FLOWLINEEFFECT_UNIFORMS = [
  {
    "type": "vec4",
    "name": "color"
  },
  {
    "type": "float",
    "name": "speed"
  },
  {
    "type": "float",
    "name": "glowPower"
  },
  {
    "type": "float",
    "name": "lineCount"
  }
];

// Attribute 信息
export const FLOWLINEEFFECT_ATTRIBUTES = [];

// Shader 类
export class FlowlineEffectShader {
  constructor() {
    this.source = FLOWLINEEFFECT_SOURCE;
    this.uniforms = FLOWLINEEFFECT_UNIFORMS;
    this.attributes = FLOWLINEEFFECT_ATTRIBUTES;
    this.hash = 'c5f81d85';
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

export default FLOWLINEEFFECT_SOURCE;