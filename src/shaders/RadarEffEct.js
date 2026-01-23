// Auto-generated from RadarEffEct.glsl
// Hash: 9ee60111
// Generated at: 罗君

const RADAREFFECT_SOURCE = `
uniform vec4 uBaseColor;
uniform bool uShowLine;
uniform float uLineWidth;
uniform float uRingCount;
uniform float uSpeed;
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 uv = materialInput.st;
    uv = uv * 2. - 1.;
    float dist = length(uv);

    float alpha = 0.0;
    float maxRadius = 1.; // 最大半径限制
    float time = czm_frameNumber / 120.;

    // 多层圆环
    for(int i = 0; i < 100; i++) {
        if(i > int(uRingCount))
            break;

       // 每个圆环的相位偏移（均匀分布）
        float offset = float(i) / float(uRingCount);

        // 创建单个圆环（使用不同的移动速度）
        float ringProgress = fract(time * uSpeed + offset); // 0到1的进度
        float ringRadius = ringProgress * maxRadius; // 当前圆环的半径

        // 计算当前点到圆环的距离
        float ringDist = abs(dist - ringRadius);

        // 圆环形状（距离圆环中心越近，值越大）
        float ring = 1.0 - smoothstep(0.0, uLineWidth, ringDist);

        // 圆环自身衰减（圆环越远越淡）
        float ringFade = 1.0 - ringProgress;

        // 综合衰减：距离中心越远越淡 + 圆环自身衰减
        float fade = (1.0 - smoothstep(0.0, maxRadius, dist)) * ringFade;

        alpha += ring * fade;
    }

    // 扫描线
    if(uShowLine) {
        const float tau = atan(1.) * 8.;
        float ang = time * tau * uSpeed;
        float ang2 = atan(uv.x, uv.y);
        ang = 1. - mod(ang2 + ang, tau);
        ang = max(ang, 0.) * pow(1. - dist, 2.);

        alpha += ang;
    }

    // 限制透明度范围
    alpha = min(alpha, 1.0);

    // 边缘淡出
    alpha *= 1.0 - smoothstep(0.8, 1.0, dist);

    material.diffuse = uBaseColor.rgb;
    material.alpha = alpha * uBaseColor.a;
    return material;
}
`;

// Uniform 信息
export const RADAREFFECT_UNIFORMS = [
  {
    "type": "vec4",
    "name": "uBaseColor"
  },
  {
    "type": "bool",
    "name": "uShowLine"
  },
  {
    "type": "float",
    "name": "uLineWidth"
  },
  {
    "type": "float",
    "name": "uRingCount"
  },
  {
    "type": "float",
    "name": "uSpeed"
  }
];

// Attribute 信息
export const RADAREFFECT_ATTRIBUTES = [];

// Shader 类
export class RadarEffEctShader {
  constructor() {
    this.source = RADAREFFECT_SOURCE;
    this.uniforms = RADAREFFECT_UNIFORMS;
    this.attributes = RADAREFFECT_ATTRIBUTES;
    this.hash = '9ee60111';
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

export default RADAREFFECT_SOURCE;