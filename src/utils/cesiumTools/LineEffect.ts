interface LineEffectOptions {
    uniforms?: Record<string, any>;
    lineWidth?: number;
    shader: string;
}
export class LineEffect {
    uniforms: LineEffectOptions['uniforms'];
    shader: LineEffectOptions['shader'];
    lines: Cesium.GroundPolylinePrimitive[];
    lineWidth: LineEffectOptions['lineWidth'];
    private _material?: Cesium.Material;

    constructor(options: LineEffectOptions) {
        this.uniforms = options.uniforms || {};
        this.shader = options.shader;
        this.lines = [];
        this.lineWidth = options.lineWidth || 1;

        this.createMaterial();
    }

    /**直接加载geojson*/
    renderGeoJSON(geoJson: FeatureCollection | Feature) {
        const features = geoJson.type === 'FeatureCollection' ? geoJson.features : [geoJson];

        for (const feature of features) {
            this.renderFeature(feature);
        }
    }

    /**
     * 渲染单个要素
     */
    private renderFeature(feature: Feature) {
        const geometry = feature.geometry;
        if (!geometry) return;

        try {
            switch (geometry.type) {
                case 'LineString':
                    this.renderLineString(geometry.coordinates);
                    break;
                case 'MultiLineString':
                    for (const line of geometry.coordinates) {
                        this.renderLineString(line);
                    }
                    break;
                case 'GeometryCollection':
                    for (const geom of geometry.geometries) {
                        this.renderFeature({
                            type: 'Feature',
                            geometry: geom,
                            properties: {}
                        });
                    }
                    break;
                default:
                    // @ts-ignore
                    console.warn(`不支持的类型: ${geometry.type}`);
            }
        } catch (error) {
            console.error(`渲染要素时出错:`, error, feature);
        }
    }

    createMaterial() {
        this._material = new Cesium.Material({
            translucent: true,
            fabric: {
                type: 'lineMaterial',
                uniforms: this.uniforms,
                source: this.shader
            }
        });
    }

    /**
     * 渲染线
     */
    private renderLineString(coordinates: number[][]) {
        if (coordinates.length < 2) return;

        // 转换坐标
        const positions = coordinates.map((coord) => {
            const [lon, lat, height = 0] = coord;
            return Cesium.Cartesian3.fromDegrees(lon, lat, height);
        });

        this.createLine(positions);
    }

    /**直接传递点进行创建*/
    createLine(points: Cesium.Cartesian3[]) {
        if (points.length < 2) return console.warn('点的数量不足，创建流动线失败');
        const line = new Cesium.GroundPolylineGeometry({
            width: this.lineWidth,
            positions: points
        });

        const primitive = new Cesium.GroundPolylinePrimitive({
            geometryInstances: [
                new Cesium.GeometryInstance({
                    geometry: line
                })
            ],
            appearance: new Cesium.MaterialAppearance({
                translucent: true,
                material: this._material
            })
        });

        this.lines.push(primitive);
    }

    getMaterial() {
        return this._material;
    }
}
