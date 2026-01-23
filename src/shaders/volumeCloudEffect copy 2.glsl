// https://github.com/Straw1997/UnityURPCloud/blob/main/Clouds/Assets/Shaders/Cloud.shader
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
  vec4 sceneColor;
};
#include <post_getGeometryData>
PostGeometryData geometry;

#define iTime czm_frameNumber/120.
#define minCloudHeight 6000.
#define earthRadius longR
#define maxCloudHeight 10000.
#define MAX_MARCHING_STEPS 128  
#define _ShapeMarchLength  300. //0.001-800
#define _BlueNoiseEffect  1. //0-1
#define _ShapeMarchMax  30 //3-100
#define _LightingMarchMax   8 //3-100
#define _DarknessThreshold   0.3 //3-100
#define _ColorDark vec3(0.1)
#define _ColorCentral vec3(0.5)
#define _ColorBright  vec3(1.)
#define _ColorCentralOffset 0.5
#define _ScatterForward 0.5
#define _ScatterForwardIntensity  0.1
#define _ScatterBackward  0.4
#define _ScatterBackwardIntensity  0.4
#define PI 3.1415926
#define _ScatterBase 0.2
#define _ScatterMultiply 0.7

uniform sampler2D iChannel1;
uniform sampler2D iChannel2;

// -----------------
//采样云时所用到的信息
struct SamplingInfo {
  vec3 position;                //采样位置
  float baseShapeTiling;          //基础形状平铺
  vec3 baseShapeRatio;          //基础形状比例(当渲染模式为Bake时启用)
  float boundBoxScaleMax;         //包围盒缩放
  vec3 boundBoxPosition;        //包围盒位置
  float detailShapeTiling;        //细节形状平铺
  float weatherTexTiling;         //天气纹理平铺
  vec2 weatherTexOffset;        //天气纹理偏移
    // float weatherTexRepair;         //天气纹理修复
  float baseShapeDetailEffect;   //基础形状细节影响
  float detailEffect;             //细节噪声影响
  float densityMultiplier;        //密度乘数(缩放)
  float cloudDensityAdjust;       //云密度调整，用于调整天气纹理云的覆盖率, 0 ~ 0.5 ~ 1 => 0 ~ weatherTex.r ~ 1
  float cloudAbsorbAdjust;        //云吸收率影响，用于调整天气纹理云的吸收率, 0 ~ 0.5 ~ 1 => 0 ~ weatherTex.b ~ 1
  vec3 windDirection;           //风向
  float windSpeed;                //风速
  vec2 cloudHeightMinMax;       //云高度的最小(x) 最大(y)值
  vec3 stratusInfo;             //层云信息，层云最小高度(x)  层云最大高度(y)  层云边缘羽化强度(z)
  vec3 cumulusInfo;             //积云信息， 积云最小高度(x)  积云最大高度(y)  积云边缘羽化强度(z)
  float cloudOffsetLower;         //云底部偏移(当渲染模式为No3DTex时启用)
  float cloudOffsetUpper;         //云顶部偏移(当渲染模式为No3DTex时启用)
  float feather;                  //云层羽化(当渲染模式为No3DTex时启用)
  vec3 sphereCenter;            //地球中心坐标
  float earthRadius;              //地球半径
};
struct CloudInfo {
  float density;          //密度
  float absorptivity;     //吸收率 
};

// ====================== Cloud params ===================================
//射线与球体相交, x 到球体最近的距离， y 穿过球体的距离
//原理是将射线方程(x = o + dl)带入球面方程求解(|x - c|^2 = r^2)
vec2 raySphereDst(vec3 sphereCenter, float sphereRadius, vec3 rayOrigin, vec3 rayDir) {
  vec3 oc = rayOrigin - sphereCenter;
  float b = dot(rayDir, oc);
  float c = dot(oc, oc) - sphereRadius * sphereRadius;
  float t = b * b - c; // t > 0有两个交点, = 0 相切， < 0 不相交

  float delta = sqrt(max(t, 0.0));
  float dstToSphere = max(-b - delta, 0.0);
  float dstInSphere = max(-b + delta - dstToSphere, 0.0);
  return vec2(dstToSphere, dstInSphere);
}

	/*
		计算相机发出的射线与云层范围的相交情况
		返回值：
			dstToCloudLayer  到云层的最近距离
			dstInCloudLayer  在云层中穿过的距离
	*/
vec2 rayCloudLayerDst(vec3 rayOrigin, vec3 rayDir, bool isShape) {
  vec3 sphereCenter = vec3(0.0);

  vec2 cloudDstMin = raySphereDst(sphereCenter, minCloudHeight + earthRadius, rayOrigin, rayDir);
  vec2 cloudDstMax = raySphereDst(sphereCenter, maxCloudHeight + earthRadius, rayOrigin, rayDir);

  float cameraHeight = wgs84_getHeight(rayOrigin);

		// 射线到云层的最近距离
  float dstToCloudLayer = 0.0;
		// 射线穿过云层的距离
  float dstInCloudLayer = 0.0;
  if(isShape) {
    // 在地表上
    if(cameraHeight <= minCloudHeight) {
      vec3 startPos = rayOrigin + rayDir * cloudDstMin.y;
      // if(wgs84_getHeight(startPos) >= 0.) {
      dstToCloudLayer = cloudDstMin.y;
      dstInCloudLayer = cloudDstMax.y - cloudDstMin.y;
      // }
      return vec2(dstToCloudLayer, dstInCloudLayer);
    }

		// 在云层内
    if(cameraHeight > minCloudHeight && cameraHeight <= maxCloudHeight) {
      dstToCloudLayer = 0.0;
      dstInCloudLayer = cloudDstMin.y > 0.0 ? cloudDstMin.x : cloudDstMax.y;
      return vec2(dstToCloudLayer, dstInCloudLayer);
    }

		// 在云层外
    dstToCloudLayer = cloudDstMax.x;
    dstInCloudLayer = cloudDstMin.y > 0.0 ? cloudDstMin.x - dstToCloudLayer : cloudDstMax.y;
  } else {
    dstToCloudLayer = 0.;
    dstInCloudLayer = cloudDstMin.y > 0. ? cloudDstMin.x : cloudDstMax.y;
  }

  return vec2(dstToCloudLayer, dstInCloudLayer);
}
// -=-=--==
//Henyey-Greenstein相位函数
float HenyeyGreenstein(float angle, float g) {
  float g2 = g * g;
  return (1.0 - g2) / (4.0 * PI * pow(1.0 + g2 - 2.0 * g * angle, 1.5));
}
//两层Henyey-Greenstein散射，使用Max混合。同时兼顾向前 向后散射
float HGScatterMax(float angle, float g_1, float intensity_1, float g_2, float intensity_2) {
  return max(intensity_1 * HenyeyGreenstein(angle, g_1), intensity_2 * HenyeyGreenstein(angle, g_2));
}
//粉糖效应，模拟云的内散射影响
float BeerPowder(float density, float absorptivity) {
  return 2.0 * exp(-density * absorptivity) * (1.0 - exp(-2.0 * density));
}
//Beer衰减
float Beer(float density, float absorptivity) {
  return exp(-density * absorptivity);
}
float saturate(float x) {
  return max(0., min(1., x));
}
//获取高度比率
float GetHeightFraction(vec3 sphereCenter, float earthRadius, vec3 pos, float height_min, float height_max) {
  float height = length(pos - sphereCenter) - earthRadius;
  return (height - height_min) / (height_max - height_min);
}
//重映射
float Remap(float original_value, float original_min, float original_max, float new_min, float new_max) {
  return new_min + ((original_value - original_min) / (original_max - original_min)) * (new_max - new_min);
}

//获取云类型密度
float GetCloudTypeDensity(float heightFraction, float cloud_min, float cloud_max, float feather) {
    //云的底部羽化需要弱一些，所以乘0.5
  return saturate(Remap(heightFraction, cloud_min, cloud_min + feather * 0.5, 0., 1.)) * saturate(Remap(heightFraction, cloud_max - feather, cloud_max, 1., 0.));
}

//在三个值间进行插值, value1 -> value2 -> value3， offset用于中间值(value2)的偏移
float Interpolation3(float value1, float value2, float value3, float x, float offset) {
  offset = clamp(offset, 0.0001, 0.9999);
  return mix(mix(value1, value2, min(x, offset) / offset), value3, max(0., x - offset) / (1.0 - offset));
}
//在三个值间进行插值, value1 -> value2 -> value3， offset用于中间值(value2)的偏移
vec3 Interpolation3(vec3 value1, vec3 value2, vec3 value3, float x, float offset) {
  offset = clamp(offset, 0.0001, 0.9999);
  return mix(mix(value1, value2, min(x, offset) / offset), value3, max(0., x - offset) / (1.0 - offset));
}

CloudInfo SampleCloudDensity_RealTime(SamplingInfo dsi, bool isCheaply) {
  CloudInfo o;

  float heightFraction = GetHeightFraction(dsi.sphereCenter, dsi.earthRadius, dsi.position, dsi.cloudHeightMinMax.x, dsi.cloudHeightMinMax.y);

    //计算云类型密度
  float stratusDensity = GetCloudTypeDensity(heightFraction, dsi.stratusInfo.x, dsi.stratusInfo.y, dsi.stratusInfo.z);
  float cumulusDensity = GetCloudTypeDensity(heightFraction, dsi.cumulusInfo.x, dsi.cumulusInfo.y, dsi.cumulusInfo.z);
  float cloudTypeDensity = mix(stratusDensity, cumulusDensity, 1.);
  if(cloudTypeDensity <= 0.) {
    o.density = 0.;
    o.absorptivity = 1.;
    return o;
  }

    //云吸收率
  float cloudAbsorptivity = Interpolation3(0., 1., 1., dsi.cloudAbsorbAdjust, 0.5);

    //采样基础纹理
  vec4 baseTex = texture(iChannel1, dsi.position.xz * 0.0001);
    //构建基础纹理的FBM
  float baseTexFBM = dot(baseTex.gba, vec3(0.5, 0.25, 0.125));
    //对基础形状添加细节，通过Remap可以不影响基础形状下添加细节
  float baseShape = Remap(baseTex.r, saturate((1.0 - baseTexFBM) * dsi.baseShapeDetailEffect), 1.0, 0., 1.0);

  float cloudDensity = baseShape * cloudTypeDensity;

    //添加细节
  if(cloudDensity > 0. && !isCheaply) {
    vec3 detailTex = texture(iChannel2, dsi.position.xz * 0.0001).rgb;
    float detailTexFBM = dot(detailTex, vec3(0.5, 0.25, 0.125));

        //根据高度从纤细到波纹的形状进行变化
    float detailNoise = detailTexFBM;//mix(detailTexFBM, 1.0 - detailTexFBM,saturate(heightFraction * 1.0));
        //通过使用remap映射细节噪声，可以保留基本形状，在边缘进行变化
    cloudDensity = Remap(cloudDensity, detailNoise * dsi.detailEffect, 1.0, 0.0, 1.0);
  }

  o.density = cloudDensity * dsi.densityMultiplier * 0.01;
  o.absorptivity = cloudAbsorptivity;

  return o;
}
float linearizeDepth(float depth) {
  return (2.0 * czm_currentFrustum.x) / (czm_currentFrustum.y + czm_currentFrustum.x - depth * (czm_currentFrustum.y - czm_currentFrustum.x));
}
//  

SamplingInfo dsi;
void main() {
  geometry = getGeometryData();

  dsi.sphereCenter = vec3(0., 0.0, 0.);
  dsi.earthRadius = earthRadius;
  dsi.cloudHeightMinMax = vec2(minCloudHeight, maxCloudHeight);
  dsi.position = geometry.positionWC;
  dsi.windDirection = vec3(1., 0., 0.);
  dsi.windSpeed = 1.;
  dsi.weatherTexTiling = 1.;
  dsi.weatherTexOffset = vec2(0.);
  dsi.stratusInfo = vec3(0.1, 0.4, 0.2);
  dsi.cumulusInfo = vec3(0.15, 0.8, 0.2);
  dsi.cloudAbsorbAdjust = 0.5;
  dsi.baseShapeTiling = 1.;
  dsi.baseShapeDetailEffect = 0.5;
  dsi.detailShapeTiling = 1.;

  vec3 cameraPos = czm_viewerPositionWC;
  vec3 viewDir = normalize(geometry.positionWC - czm_viewerPositionWC);
  vec3 lightDir = normalize(czm_sunDirectionWC);

  vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, geometry.depth);
  float dstToObj = eyeCoordinate.w;

  vec2 dstCloud = rayCloudLayerDst(cameraPos, viewDir, true);
  float dstToCloud = dstCloud.x;
  float dstInCloud = dstCloud.y;

  //不在包围盒内或被物体遮挡 直接显示背景
  if(dstInCloud <= 0. || dstToObj <= dstToCloud) {
    out_FragColor = geometry.sceneColor;
    return;
  }

  //穿出云覆盖范围的位置(结束位置)
  float endPos = dstToCloud + dstInCloud;
  //蓝噪声
  float blueNoise = texture(iChannel2, v_textureCoordinates).r;
  //使用蓝噪声在对开始步进位置进行随机，配合TAA减轻因步进距离太大造成的层次感
  float currentMarchLength = dstToCloud + _ShapeMarchLength * blueNoise * _BlueNoiseEffect;

   //当前步进位置
  vec3 currentPos = cameraPos + currentMarchLength * viewDir;

  //累计总密度
  float totalDensity = 0.;
  //总亮度
  vec3 totalLum = vec3(0.);
  //光照衰减
  float lightAttenuation = 1.0;

  //一开始我们会以比较大的步长进行步进(2倍步长)进行密度采样检测，当检测到云时，退回来进行正常云的采样、光照计算
  //当累计采样到一定次数0密度时，在切换成大步进，从而加速退出
  //云测试密度
  float densityTest = 0.;
  //上一次采样密度
  float densityPrevious = 0.;
  //0密度采样次数
  int densitySampleCount_zero = 0;

  for(int marchNumber = 0; marchNumber < _ShapeMarchMax; marchNumber++) {
    if(densityTest == 0.) {
      //向观察方向步进2倍的长度
      currentMarchLength += _ShapeMarchLength * 2.0;
      currentPos = cameraPos + currentMarchLength * viewDir;

      //如果步进到被物体遮挡,或穿出云覆盖范围时,跳出循环
      if(dstToObj <= currentMarchLength || endPos <= currentMarchLength) {
        break;
      }

      //进行密度采样，测试是否继续大步前进
      dsi.position = currentPos;
      densityTest = SampleCloudDensity_RealTime(dsi, true).density;

      //如果检测到云，往后退一步(因为我们可能错过了开始位置)
      if(densityTest > 0.) {
        currentMarchLength -= _ShapeMarchLength;
      }
    } else {
       //采样该区域的密度
      currentPos = cameraPos + currentMarchLength * viewDir;
      dsi.position = currentPos;
      CloudInfo ci = SampleCloudDensity_RealTime(dsi, false);
      //如果当前采样密度和上次采样密度都基本是0，那么进行累计，当到达指定数值时，切换到大步进
      if(ci.density == 0. && densityPrevious == 0.) {
        densitySampleCount_zero++;
                                //累计检测到指定数值，切换到大步进
        if(densitySampleCount_zero >= 8) {
          densityTest = 0.;
          densitySampleCount_zero = 0;
          continue;
        }
      }
      float density = ci.density * _ShapeMarchLength;

      //密度大于阈值开始计算光照
      float currentLum = 0.;
      if(density > 0.01) {
        //计算该区域的光照贡献，从当前点向灯光方向步进
        vec2 dstCloud_light = rayCloudLayerDst(currentPos, lightDir, false);
                                //灯光步进长度
        float lightMarchLength = dstCloud_light.y / float(_LightingMarchMax);
                                //当前步进位置
        vec3 currentPos_light = currentPos;
                                //灯光方向密度
        float totalDensity_light = 0.;

                                //向灯光方向进行步进
        for(int marchNumber_light = 0; marchNumber_light < _LightingMarchMax; marchNumber_light++) {
          currentPos_light += lightDir * lightMarchLength;
          dsi.position = currentPos_light;
          float density_Light = SampleCloudDensity_RealTime(dsi, true).density * lightMarchLength;
          totalDensity_light += density_Light;
        }
                                //光照强度
        currentLum = BeerPowder(totalDensity_light, ci.absorptivity);

        currentLum = _DarknessThreshold + currentLum * (1.0 - _DarknessThreshold);
                            //云层颜色
        vec3 cloudColor = Interpolation3(_ColorDark.rgb, _ColorCentral.rgb, _ColorBright.rgb, saturate(currentLum), _ColorCentralOffset) * czm_lightColor;

        float phase = HGScatterMax(dot(viewDir, lightDir), _ScatterForward, _ScatterForwardIntensity, _ScatterBackward, _ScatterBackwardIntensity);
        phase = _ScatterBase + phase * _ScatterMultiply;
        totalLum += lightAttenuation * cloudColor * density * phase;
        totalDensity += density;
        lightAttenuation *= Beer(density, ci.absorptivity);

        if(lightAttenuation < 0.01)
          break;
      }
      currentMarchLength += _ShapeMarchLength;
      //如果步进到被物体遮挡,或穿出云覆盖范围时,跳出循环
      if(dstToObj <= currentMarchLength || endPos <= currentMarchLength) {
        break;
      }
      densityPrevious = ci.density;
    }

  }

  out_FragColor = vec4(geometry.sceneColor.rgb * lightAttenuation + totalLum, 1.);
  // out_FragColor = vec4(dstInCloud / 10000.0, 0.0, 0.0, 1.0);

}
