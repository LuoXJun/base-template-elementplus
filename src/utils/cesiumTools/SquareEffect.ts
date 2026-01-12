interface SquareEffectOptions {
    center?: Cesium.Cartesian3;
    radius?: number;
    uniforms?: Record<string, any>;
    shader: string;
}
export class SquareEffect {
    center: SquareEffectOptions['center'];
    radius: SquareEffectOptions['radius'];
    uniforms: SquareEffectOptions['uniforms'];
    shader: SquareEffectOptions['shader'];
    private _material?: Cesium.Material;

    constructor(options: SquareEffectOptions) {
        this.center = options.center || Cesium.Cartesian3.fromDegrees(100, 30, 0);
        this.radius = options.radius || 1000000;
        this.uniforms = options.uniforms || {};
        this.shader = options.shader;
    }

    createRectangleFromCenter(center: Cesium.Cartesian3, radius: number) {
        // 将笛卡尔坐标转换为经纬度（弧度）
        const cartographic = Cesium.Cartographic.fromCartesian(center);

        // 计算半宽半高（以弧度为单位）
        const latOffset = radius / 6378137; // 地球半径
        const lonOffset = radius / (6378137 * Math.cos(cartographic.latitude));

        // 计算矩形边界
        const west = cartographic.longitude - lonOffset;
        const south = cartographic.latitude - latOffset;
        const east = cartographic.longitude + lonOffset;
        const north = cartographic.latitude + latOffset;

        return new Cesium.Rectangle(west, south, east, north);
    }

    getMaterial() {
        return this._material;
    }

    createRectangle() {
        const rectangle = new Cesium.RectangleGeometry({
            rectangle: this.createRectangleFromCenter(this.center!, this.radius!)
        });

        const material = (this._material = new Cesium.Material({
            translucent: true,
            fabric: {
                type: 'squareMaterial',
                uniforms: this.uniforms,
                source: this.shader
            }
        }));

        const primitive = new Cesium.GroundPrimitive({
            geometryInstances: [
                new Cesium.GeometryInstance({
                    geometry: rectangle
                })
            ],
            appearance: new Cesium.MaterialAppearance({
                translucent: true,
                material
            })
        });

        return primitive;
    }
}
