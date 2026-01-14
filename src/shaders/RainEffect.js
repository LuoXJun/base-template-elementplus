// Auto-generated from RainEffect.glsl
// Hash: d9351465
// Generated at: 2026-01-14T01:32:31.622Z

const RAINEFFECT_SOURCE = `
uniform sampler2D colorTexture;
in vec2 v_textureCoordinates;
uniform float tiltAngle;
uniform float rainSize;
uniform float rainSpeed;
uniform float rainDensity;

float hash(float x) {
    return fract(sin(x * 133.3) * 13.13);
}
void main(void) {
    float iTime = czm_frameNumber / 120. * rainSpeed;
    float _density = 30. - clamp(rainDensity * 0.8, 0.09, 0.8) * 28.;
    vec2 uv = gl_FragCoord.xy * 0.99;
    float col = .6 - _density * fract((uv.x * .2 + uv.y * rainSize / 100.) * fract(uv.x * .91) + iTime) * 1.5;
    vec4 o = vec4(col, col, col, 1.0);
    if(col < 0.01) {
        o = vec4(0, 0, 0, 1.0);
    }
    out_FragColor = mix(texture(colorTexture, v_textureCoordinates), o, 0.5);
}
`;

// Uniform 信息
export const RAINEFFECT_UNIFORMS = [
  {
    "type": "sampler2D",
    "name": "colorTexture"
  },
  {
    "type": "float",
    "name": "tiltAngle"
  },
  {
    "type": "float",
    "name": "rainSize"
  },
  {
    "type": "float",
    "name": "rainSpeed"
  },
  {
    "type": "float",
    "name": "rainDensity"
  }
];

// Attribute 信息
export const RAINEFFECT_ATTRIBUTES = [];

// Shader 类
export class RainEffectShader {
  constructor() {
    this.source = RAINEFFECT_SOURCE;
    this.uniforms = RAINEFFECT_UNIFORMS;
    this.attributes = RAINEFFECT_ATTRIBUTES;
    this.hash = 'd9351465';
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

export default RAINEFFECT_SOURCE;