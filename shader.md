# cesium常用内置变量

czm_viewerPositionWC //相机位置
czm_sunDirectionWC //太阳光照方向
v_textureCoordinates //归一化坐标

## 常用自定义函数和变量

geometry = getGeometryData(); //获取几何信息

```js
// 构造体
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
geometry = getGeometryData();
```
