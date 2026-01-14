// Auto-generated from snowEffect.glsl
// Hash: cf4dc950
// Generated at: 2026-01-14T01:32:31.623Z

const SNOWEFFECT_SOURCE = `
precision highp float; 

#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
uniform sampler2D colorTexture;
uniform float splitX;
uniform float snowThickness;
uniform float snowSpeed;
uniform float maxDistance;
uniform bool showParticles;
uniform bool showCover;
uniform bool coverSky;
uniform float snowDensity;
uniform float skyCoverage;
uniform float snowSize;
uniform float normalSmoothing;

const float f_Snow_Coverage_Max_Rate = 5.0;

float WIDTH = 0.5;

float vmax(vec3 a) {
    return max(max(a.x, a.y), a.z);
}
float vmin(vec3 a) {
    return min(min(a.x, a.y), a.z);
}

vec3 rgb2hsv(vec3 rgb) //convert rgb to hsv color space
{
    float c_max = vmax(rgb);
    float c_min = vmin(rgb);
    vec3 hsv = vec3(0, c_max > 0. ? 1. - c_min / c_max : 0.0, c_max);

    if(c_max == c_min) {
        hsv.x = 6.0;
    } else if(c_max == rgb.r) {
        hsv.x = 0.0 + (rgb.g - rgb.b) / (c_max - c_min);
    } else if(c_max == rgb.g) {
        hsv.x = 2.0 + (rgb.b - rgb.r) / (c_max - c_min);
    } else if(c_max == rgb.b) {
        hsv.x = 4.0 + (rgb.r - rgb.g) / (c_max - c_min);
    }
    hsv.x = fract(hsv.x / 6.0);
    hsv = clamp(hsv, 0.0, 1.0);
    return hsv;
}

vec3 iMouse3 = vec3(0.44375, 0.3778, -0.15625);
float wdistance(vec3 p) {
    return length(fract(p + iMouse3) - 0.5);
}

vec3 ToWhite(vec3 color, float fCoverage_Rate, float radio) {
    vec3 hsv = rgb2hsv(color);
    return mix(vec3(0.9, 0.9, 0.95) * radio, color, smoothstep(0.0, fCoverage_Rate, length(vec3(0.0, 0.933, 0.933) * wdistance(hsv))));
}

float VaryFaction(in vec3 positionWC, in vec3 normalWC) {
    // vec3 vn = VaryNf(40.0 * vec3(uv.x, 1.0, uv.y), vec3(0.0, 1.0, 0.0), 4.0);
    vec3 vn = normalWC;//VaryNf(40.0 * positionWC, normalWC, 4.0);
    vec3 sunDir = czm_sunDirectionWC;
    return (0.2 + 0.2 * max(dot(normalize(-sunDir.xz), vn.xz), 0.0) + 0.1 * max(vn.y, 0.0) + 0.8 * max(dot(vn, sunDir), 0.0));
}

vec3 getSnowCoverColor(in vec3 baseColor, in float snowCoverage, in vec3 positionWC, in vec3 normalWC) {
    float radio = VaryFaction(positionWC, normalWC);
    vec3 snowColor = ToWhite(baseColor.rgb, f_Snow_Coverage_Max_Rate * snowCoverage, 1.);
    return snowColor;
}

vec3 getSnowColor(in vec3 color, in float iTime, in float snowDensity, in float snowOpacity) {

    vec2 fragCoord = gl_FragCoord.xy;
    vec2 iResolution = czm_viewport.zw;

    vec2 uv = fragCoord / iResolution.xy;
    vec3 baseColor = color;
    float LAYERS = snowDensity * 100.0;

    // snowy 
    const mat3 p = mat3(13.323122, 23.5112, 21.71123, 21.1212, 28.7312, 11.9312, 21.8112, 14.7212, 61.3934);
    uv = vec2(uv.x * 2. + iTime * 0.01, uv.y);
    vec3 acc = vec3(0.0);
    float d;

    for(float i = 0.; i < 100.; i += 1.0) {
        if(i >= LAYERS)
            break;
        if(uv.y < i / LAYERS)
            continue;
        float fi = float(i + 5.0);
        vec2 q = uv * (1.0 + fi * snowSize);
        q += vec2(q.y * (WIDTH * mod(fi * 7.238917, 1.) - WIDTH * .5), iTime / (1. + fi * snowSize * .03));
        vec3 n = vec3(floor(q), 31.189 + fi);
        vec3 m = floor(n) * .00001 + fract(n);
        vec3 mp = (31415.9 + m) / fract(p * m);
        vec3 r = fract(mp);
        vec2 s = abs(mod(q, 1.) - .5 + .9 * r.xy - .45);
        s += .01 * abs(2. * fract(10. * q.yx) - 1.);

        d = .1 * max(s.x - s.y, s.x + s.y) + max(s.x, s.y) - .01;

        float edge = 0.005 + 0.05 * min(.5 * abs(fi - 5. - sin(iTime * 0.01)), 1.);
        acc += vec3(smoothstep(edge, -edge, d) * (r.x / (1. + .02 * fi * snowSize)));

    }
    baseColor.rgb = mix(baseColor.rgb, vec3(1.0), acc.x * 4.0 * snowOpacity);

    // Output to screen
    return baseColor;
}

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
};
#include <post_getGeometryData>
PostGeometryData geometry;

// -----------------=-=-=-=-=-=-=-==-=- 

void main() {
    vec2 screenUV = v_textureCoordinates;//屏幕空间纹理坐标，左上角为(0.,0.)，右下角为(1.,1.)
    vec4 color = texture(colorTexture, screenUV);//获取上一个处理节点传入颜色
    geometry = getGeometryData();

    float x = splitX < 0. ? 1. - screenUV.x : screenUV.x;
    float maxX = abs(splitX);
    if(x <= maxX) {
        vec3 positionWC = geometry.positionWC;
        vec3 normalWC = normalize(cross(dFdy(positionWC.xyz), dFdx(positionWC.xyz)));
        vec3 positionEC = geometry.positionEC;
        bool isSky = geometry.isSky;

        float distanceToEye = length(positionEC);
        float fogScale = 1. - clamp(0.1 * distanceToEye / maxDistance, 0., 1.);
        float cameraHeight = wgs84_getHeight(czm_viewerPositionWC);
        float snowOpacity = 1. - abs(cameraHeight) / maxDistance;
        float time = snowSpeed * czm_frameNumber / 60.;

        if(showCover && isSky == false && snowThickness > 0.) {

            float slope = computeAspectSlope(geometry).y;
            slope = clamp(slope, 0.001, 1.);
            float snowScale = (1. - slope) * snowThickness;
            snowScale = clamp(snowScale, 0.1, 1.);
            float snowCoverage = snowScale * fogScale;
            if(snowCoverage > 0.0) {
                color.rgb = getSnowCoverColor(color.rgb, snowCoverage, positionWC, normalWC);
            }
        } else if(isSky == true && coverSky == true && snowOpacity > 0.45) {
            color.rgb = getSnowCoverColor(color.rgb, snowOpacity * skyCoverage, positionWC, normalWC);
        }
        if(snowOpacity > 0. && showParticles == true) {
            color.rgb = getSnowColor(color.rgb, time, snowDensity, snowOpacity);
        }
        if(showParticles == true) {
            color.rgb = getSnowColor(color.rgb, time, snowDensity, 1.);
        }
    }
    out_FragColor = color;

}

`;

// Uniform 信息
export const SNOWEFFECT_UNIFORMS = [
  {
    "type": "sampler2D",
    "name": "colorTexture"
  },
  {
    "type": "float",
    "name": "splitX"
  },
  {
    "type": "float",
    "name": "snowThickness"
  },
  {
    "type": "float",
    "name": "snowSpeed"
  },
  {
    "type": "float",
    "name": "maxDistance"
  },
  {
    "type": "bool",
    "name": "showParticles"
  },
  {
    "type": "bool",
    "name": "showCover"
  },
  {
    "type": "bool",
    "name": "coverSky"
  },
  {
    "type": "float",
    "name": "snowDensity"
  },
  {
    "type": "float",
    "name": "skyCoverage"
  },
  {
    "type": "float",
    "name": "snowSize"
  },
  {
    "type": "float",
    "name": "normalSmoothing"
  }
];

// Attribute 信息
export const SNOWEFFECT_ATTRIBUTES = [];

// Shader 类
export class SnowEffectShader {
  constructor() {
    this.source = SNOWEFFECT_SOURCE;
    this.uniforms = SNOWEFFECT_UNIFORMS;
    this.attributes = SNOWEFFECT_ATTRIBUTES;
    this.hash = 'cf4dc950';
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

export default SNOWEFFECT_SOURCE;