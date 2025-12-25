/**
 * 已知中心点和半径绘制矩形（单位为度）
 * @param {Cesium.Cartesian3} center - 中心点（经纬度转Cartesian3）
 * @param {number} radiusDegrees - 半径（度数）
 */
export function createRectangleByCenter(center: Cesium.Cartesian3, radiusDegrees: number) {
    // 将Cartesian3转换为Cartographic（经纬度弧度）
    const cartographic = Cesium.Cartographic.fromCartesian(center);

    // 转换为度数
    const centerLon = Cesium.Math.toDegrees(cartographic.longitude);
    const centerLat = Cesium.Math.toDegrees(cartographic.latitude);

    // 计算矩形范围
    const west = centerLon - radiusDegrees;
    const south = centerLat - radiusDegrees;
    const east = centerLon + radiusDegrees;
    const north = centerLat + radiusDegrees;

    // 创建矩形几何
    const rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);
    const rectangleGeometry = new Cesium.RectangleGeometry({
        rectangle: rectangle,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
    });

    // ====
    const vertexShaderSource = `
    attribute vec3 position;
    void main() {
        gl_Position = czm_modelViewProjection * vec4(position, 1.0);
    }
`;

    // 自定义片段着色器
    const fragmentShaderSource = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);  
    }
`;

    // 创建自定义的材质
    const customMaterial = new Cesium.CustomShader({
        fragmentShaderText: fragmentShaderSource
    });

    // 创建Primitive
    const rectanglePrimitive = new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: rectangleGeometry
        }),
        appearance: new Cesium.MaterialAppearance({
            material: customMaterial
        })
    });

    return rectanglePrimitive;
}
