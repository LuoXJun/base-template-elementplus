// Auto-generated from post_getGeometryData.glsl
// Hash: fb5fc0d3
// Generated at: 罗君

const POST_GETGEOMETRYDATA_SOURCE = `
uniform sampler2D depthTexture;
in vec2 v_textureCoordinates;
uniform sampler2D colorTexture;

/*封装后期处理几何体参数数据结构及其相关计算的常用方法：*/

#include <wgs84_cartesian3>

#ifndef POST_GEOMETRY_DATA
struct PostGeometryData {
    vec3 positionWC;//位置坐标（世界空间）
    vec3 positionEC;//位置坐标（相机空间）
    vec3 positionGC;//投影到椭球表面的位置坐标（世界空间）
    vec3 normalWC;//法线坐标（世界空间）
    vec3 normalEC;//法线坐标（相机空间）
    vec3 normalGC;//投影到椭球表面的法线坐标（世界空间）
    vec2 uv;//投影到椭球表面的纹理坐标
    float height;//海拔高度，精度较低，噪点较多，谨慎使用
    float depth;//深度
    bool isSky;//天空标记，true表示当前点为天空背景
    vec4 sceneColor;//场景颜色
};
#endif

/**
根据屏幕坐标和深度值计算logDepthOrDepth三维空间位置（世界空间）
*/
vec3 getPositionWC(in float logDepthOrDepth, in vec2 fragCoord) {
    vec4 eyeCoordinate = czm_windowToEyeCoordinates(fragCoord, logDepthOrDepth);
    vec4 worldCoordinate4 = czm_inverseView * eyeCoordinate;
    vec3 positionWC = worldCoordinate4.xyz / worldCoordinate4.w;
    return positionWC;
}
/**
根据屏幕坐标计算三维空间位置（世界空间）
*/
vec3 getPositionWC(in vec2 fragCoord) {
    vec2 textureCoords = fragCoord.xy / czm_viewport.zw;
    vec4 depth4 = texture(depthTexture, textureCoords);
    float logDepthOrDepth = czm_unpackDepth(depth4);
    return getPositionWC(logDepthOrDepth, fragCoord);
}
/**
获取当前像素点的三维空间位置（世界空间）
*/
vec3 getPositionWC() {
    return getPositionWC(gl_FragCoord.xy);
}

/**
根据屏幕坐标计算三维空间位置（相机空间）
*/
vec3 getPositionEC(in sampler2D depthTexture, in vec2 fragCoord) {
    vec2 textureCoords = fragCoord.xy / czm_viewport.zw;
    vec4 depth4 = texture(depthTexture, textureCoords);
    float logDepthOrDepth = czm_unpackDepth(depth4);
    vec4 eyeCoordinate = czm_windowToEyeCoordinates(fragCoord, logDepthOrDepth);
    return eyeCoordinate.xyz / eyeCoordinate.w;
}
/**
根据屏幕坐标计算三维空间位置（相机空间）
*/
vec3 getPositionEC(in sampler2D depthTexture) {
    return getPositionEC(depthTexture, gl_FragCoord.xy);
}
/**
根据屏幕坐标计算三维空间位置（相机空间）
*/
vec3 getPositionEC(in vec2 fragCoord) {
    vec2 textureCoords = fragCoord.xy / czm_viewport.zw;
    vec4 depth4 = texture(depthTexture, textureCoords);
    float logDepthOrDepth = czm_unpackDepth(depth4);
    vec4 eyeCoordinate = czm_windowToEyeCoordinates(fragCoord, logDepthOrDepth);
    return eyeCoordinate.xyz / eyeCoordinate.w;
}
/**
获取当前像素点的三维空间位置（相机空间）
*/
vec3 getPositionEC() {
    return getPositionEC(gl_FragCoord.xy);
}

/**
计算三角形法线
*/
vec3 computeNormal(in vec3 a, in vec3 b, in vec3 c) {
    vec3 v0 = c - b;
    vec3 v1 = a - b;
    vec3 n = cross(v0, v1);
    float l = n.x * n.x + n.y * n.y + n.z * n.z;
    if(l > 0.) {
        return n * (1. / sqrt(l));
    }
    return vec3(0.);
}
/**
获取一个栅格的法线（相机空间），取栅格内两个三角形法线平均值
*/
void getNormalEC(in vec2 fragCoord, out vec3 normalWC) {
    float delta = 1.;
    vec3 a = getPositionEC(fragCoord);//(0,0)
    vec3 b = getPositionEC(fragCoord + vec2(0., delta));//(0,1)
    vec3 c = getPositionEC(fragCoord + delta);//(1,1)
    vec3 d = getPositionEC(fragCoord + vec2(delta, 0.));//(1,0)
    vec3 n0 = computeNormal(c, b, a);
    vec3 n1 = computeNormal(d, c, a);
    normalWC = (n0 + n1) * 0.5;
}
/**
获取一个栅格的法线（相机空间），取相邻8个点法线平均值
*/
vec3 getNormalEC(in vec2 fragCoord, in bool sample9) {
    float count = 0.;
    vec3 sum, n;
    if(sample9 == false) {
        getNormalEC(fragCoord, sum);
        count = 1.;
    } else {
        for(int i = -1; i <= 1; i++) {
            for(int j = -1; j <= 1; j++) {
                getNormalEC(fragCoord + vec2(i, j), n);
                sum += n;
                count += 1.;
            }
        }
    }
    return sum / count;
}
/**
获取当前像素点的法线（相机空间）
*/
vec3 getNormalEC(in bool sample9) {
    return getNormalEC(gl_FragCoord.xy, sample9);
}
/**
获取一个栅格的法线（相机空间）
*/
vec3 getNormalEC(in vec2 fragCoord) {
    return getNormalEC(fragCoord, true);
}
/**
获取当前像素点的法线（相机空间）
*/
vec3 getNormalEC() {
    return getNormalEC(gl_FragCoord.xy, true);
}

/**
获取一个栅格的法线（世界空间），取栅格内两个三角形法线平均值。注意：此方法在相机离地面较近时，噪点很多
*/
void getNormalWC(in vec2 fragCoord, out vec3 normalWC) {
    float delta = 1.;
    vec3 a = getPositionWC(fragCoord);//(0,0)
    vec3 b = getPositionWC(fragCoord + vec2(0., delta));//(0,1)
    vec3 c = getPositionWC(fragCoord + delta);//(1,1)
    vec3 d = getPositionWC(fragCoord + vec2(delta, 0.));//(1,0)
    vec3 n0 = computeNormal(c, b, a);
    vec3 n1 = computeNormal(d, c, a);
    normalWC = (n0 + n1) * 0.5;
}
/**
获取一个栅格的法线（世界空间），取相邻8个点法线平均值。注意：此方法在相机离地面较近时，噪点很多
*/
vec3 getNormalWC(in vec2 fragCoord, in bool sample9) {
    float count = 0.;
    vec3 sum, n;
    if(sample9 == false) {
        getNormalWC(fragCoord, sum);
        count = 1.;
    } else {
        for(int i = -1; i <= 1; i++) {
            for(int j = -1; j <= 1; j++) {
                getNormalWC(fragCoord + vec2(i, j), n);
                sum += n;
                count += 1.;
            }
        }
    }
    return sum / count;
}
/**
获取当前像素点的法线（世界空间），取相邻8个点法线平均值。注意：此方法在相机离地面较近时，噪点很多
*/
vec3 getNormalWC(in bool sample9) {
    return getNormalWC(gl_FragCoord.xy, sample9);
}
/**
获取一个栅格的法线（世界空间），取相邻8个点法线平均值。注意：此方法在相机离地面较近时，噪点很多
*/
vec3 getNormalWC(in vec2 fragCoord) {
    return getNormalWC(fragCoord, true);
}
/**
获取当前像素点的法线（相机空间）
*/
vec3 getNormalWC() {
    return getNormalWC(gl_FragCoord.xy, true);
}

/**
计算坡向、坡度，返回值x为坡向、y为坡度，坡度范围0~pi/2
*/
vec2 computeAspectSlope(in vec3 positionWC, in vec3 normalWC, in vec3 ellipsoidNormal) {
    float northPoleZ = czm_ellipsoidRadii.z;
    vec3 northPolePositionWC = vec3(0.0, 0.0, northPoleZ);
    vec3 vectorEastWC = normalize(cross(northPolePositionWC - positionWC, ellipsoidNormal));
    float dotProd = abs(dot(ellipsoidNormal, normalWC));
    float slope = acos(dotProd);
    vec3 normalRejected = ellipsoidNormal * dotProd;
    vec3 normalProjected = normalWC - normalRejected;
    vec3 aspectVector = normalize(normalProjected);
    float aspect = acos(dot(aspectVector, vectorEastWC));
    float determ = dot(cross(vectorEastWC, aspectVector), ellipsoidNormal);
    aspect = czm_branchFreeTernary(determ < 0.0, 2.0 * czm_pi - aspect, aspect);
    return vec2(aspect, slope);
}

/**
计算坡向、坡度，返回值x为坡向、y为坡度，坡度范围0~pi/2。如果传入的position和normal是相机空间的坐标，则指定toEye为true。
*/
vec2 computeAspectSlope(in vec3 positionEC, in vec3 normalEC, in vec3 normalGC, in bool toEye) {
    if(toEye == false) {
        return computeAspectSlope(positionEC, normalEC, normalGC);
    }
    vec3 ellipsoidNormalEC = czm_normal * normalGC;
    float northPoleZ = czm_ellipsoidRadii.z;
    vec3 northPolePositionEC = czm_normal * vec3(0.0, 0.0, northPoleZ);
    vec3 vectorEastEC = normalize(cross(northPolePositionEC - positionEC, ellipsoidNormalEC));
    float dotProd = abs(dot(ellipsoidNormalEC, normalEC));
    float slope = acos(dotProd);
    vec3 normalRejected = ellipsoidNormalEC * dotProd;
    vec3 normalProjected = normalEC - normalRejected;
    vec3 aspectVector = normalize(normalProjected);
    float aspect = acos(dot(aspectVector, vectorEastEC));
    float determ = dot(cross(vectorEastEC, aspectVector), ellipsoidNormalEC);
    aspect = czm_branchFreeTernary(determ < 0.0, 2.0 * czm_pi - aspect, aspect);
    return vec2(aspect, slope);
}
/**
计算坡向、坡度，返回值x为坡向、y为坡度，坡度范围0~pi/2。如果需要使用相机空间position和normal进行计算，则指定toEye为true。
*/
vec2 computeAspectSlope(in PostGeometryData geometry, in bool toEye) {
    if(toEye == true) {
        return computeAspectSlope(geometry.positionEC, geometry.normalEC, geometry.normalGC, true);
    }
    return computeAspectSlope(geometry.positionWC, geometry.normalWC, geometry.normalGC);
}
/**
计算坡向、坡度，返回值x为坡向、y为坡度，坡度范围0~pi/2
*/
vec2 computeAspectSlope(in PostGeometryData geometry) {
    return computeAspectSlope(geometry.positionWC, geometry.normalWC, geometry.normalGC);
}

// 将世界坐标转换到屏幕空间坐标，并返回深度（在深度图所使用的空间中）
float getSceneDepth(vec3 worldPos) {
    vec4 clipPos = czm_modelViewProjection * vec4(worldPos, 1.0);
    float depth = clipPos.z / clipPos.w; // 归一化深度，范围[-1,1]或[0,1]取决于具体实现
    // 通常深度图存储的是非线性的深度，所以这里需要根据你的深度图格式调整
    // 假设深度图存储的是gl_FragCoord.z，即已经经过投影矩阵变换并归一化到[0,1]
    // 那么我们可以这样转换：
    depth = depth * 0.5 + 0.5; // 如果投影矩阵是OpenGL的透视投影，且深度图是[0,1]范围
    return depth;
}

/**
获取后期处理常用的几何体参数，sample9指示是否使用邻近8个点的法线进行插值
*/
PostGeometryData getGeometryData(in bool sample9) {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 textureCoords = v_textureCoordinates;
    PostGeometryData geometry;
    vec4 depth4 = texture(depthTexture, textureCoords);
    float depth = czm_unpackDepth(depth4);
    vec4 eyeCoordinate = czm_windowToEyeCoordinates(fragCoord, depth);
    vec4 worldCoordinate4 = czm_inverseView * eyeCoordinate;
    vec3 normalEC = getNormalEC(fragCoord, sample9);
    geometry.positionWC = worldCoordinate4.xyz / worldCoordinate4.w;
    geometry.positionEC = eyeCoordinate.xyz / eyeCoordinate.w;
    geometry.normalEC = normalEC;
    geometry.normalWC = czm_inverseNormal * normalEC;
    geometry.positionGC = wgs84_scaleToGeodeticSurface(geometry.positionWC);
    geometry.normalGC = wgs84_geodeticSurfaceNormal(geometry.positionGC);
    geometry.uv = czm_ellipsoidTextureCoordinates(geometry.normalGC);
    geometry.depth = depth;
    geometry.isSky = depth >= 1.;
    vec3 h = geometry.positionWC - geometry.positionGC;
    geometry.height = sign(dot(h, geometry.positionWC)) * length(h);
    geometry.sceneColor = texture(colorTexture, v_textureCoordinates);
    return geometry;
}
/**
获取后期处理常用的几何体参数，默认使用使用邻近8个点的法线进行插值
*/
PostGeometryData getGeometryData() {
    return getGeometryData(true);
}

`;

// Uniform 信息
export const POST_GETGEOMETRYDATA_UNIFORMS = [
  {
    "type": "sampler2D",
    "name": "depthTexture"
  },
  {
    "type": "sampler2D",
    "name": "colorTexture"
  }
];

// Attribute 信息
export const POST_GETGEOMETRYDATA_ATTRIBUTES = [];

// Shader 类
export class PostGetGeometryDataShader {
  constructor() {
    this.source = POST_GETGEOMETRYDATA_SOURCE;
    this.uniforms = POST_GETGEOMETRYDATA_UNIFORMS;
    this.attributes = POST_GETGEOMETRYDATA_ATTRIBUTES;
    this.hash = 'fb5fc0d3';
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

export default POST_GETGEOMETRYDATA_SOURCE;