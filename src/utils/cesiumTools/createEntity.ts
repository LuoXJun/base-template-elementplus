export const createLine = async (
    coordinates: number[][],
    properties: any,
    options: RenderOptions
) => {
    if (coordinates.length < 2) {
        return;
    }

    // 转换坐标
    const positions = coordinates.map((coord) => {
        const [lon, lat, height = 0] = coord;
        return Cesium.Cartesian3.fromDegrees(lon, lat, height);
    });

    // 使用 Entity API 渲染线
    const line = {
        polyline: {
            positions: positions,
            width: options.polylineWidth,
            material: options.polylineColor,
            clampToGround: true
        },
        properties: properties
    };

    return line;
};
