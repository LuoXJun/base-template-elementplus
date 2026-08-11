import { createLine } from './createEntity';

const lineColor = Cesium.Color.fromCssColorString('#f5ad47');
const fillColor = Cesium.Color.CYAN.withAlpha(0.2);
const lineWidth = 2;

/**
 * @description 自定义绘制geojson格式文件
 * */
export class RenderGeoJsonByGround {
    private viewer: Cesium.Viewer;
    private scene: Cesium.Scene;
    private fillPrimitives: Cesium.GroundPrimitive[] = [];
    private strokePrimitives: Cesium.GroundPolylinePrimitive[] = [];
    entities: Cesium.Entity[] = [];

    private options: RenderOptions;

    constructor(viewer: Cesium.Viewer, options?: Partial<RenderOptions>) {
        this.viewer = viewer;
        this.scene = viewer.scene;
        this.options = {
            fillColor: options?.fillColor || fillColor,
            strokeColor: options?.strokeColor || lineColor,
            strokeWidth: options?.strokeWidth || lineWidth,
            strokeHoles: options?.strokeHoles ?? true,
            pointColor: options?.pointColor || Cesium.Color.RED,
            pointSize: options?.pointSize || 10,
            polylineColor: options?.polylineColor || lineColor,
            polylineWidth: options?.polylineWidth || lineWidth,
            ...options
        };
    }

    /**
     * 渲染所有 GeoJSON 要素
     */
    async renderGeoJSON(geoJson: FeatureCollection | Feature) {
        const features = geoJson.type === 'FeatureCollection' ? geoJson.features : [geoJson];

        for (const feature of features) {
            await this.renderFeature(feature);
        }
    }

    /**
     * 渲染单个要素
     */
    private async renderFeature(feature: Feature) {
        const geometry = feature.geometry;
        const properties = feature.properties || {};
        if (!geometry) {
            return;
        }

        switch (geometry.type) {
            case 'LineString':
                await this.renderLineString(geometry.coordinates, properties);
                break;
            case 'MultiLineString':
                for (const line of geometry.coordinates) {
                    await this.renderLineString(line, properties);
                }
                break;
            case 'GeometryCollection':
                for (const geom of geometry.geometries) {
                    await this.renderFeature({
                        type: 'Feature',
                        geometry: geom,
                        properties: properties
                    });
                }
                break;
            default:
                // @ts-ignore
                console.warn(`不支持的类型: ${geometry.type}`);
        }
    }

    private async renderLineString(coordinates: number[][], properties: any) {
        const lineConstructorOptions = await createLine(coordinates, properties, this.options);
        const line = this.viewer.entities.add(lineConstructorOptions!);

        this.entities.push(line);
    }

    /**
     * 清除所有渲染
     */
    clear() {
        // 清除 Primitive
        this.fillPrimitives.forEach((primitive) => {
            this.scene.primitives.remove(primitive);
            if (!primitive.isDestroyed()) {
                primitive.destroy();
            }
        });

        this.strokePrimitives.forEach((primitive) => {
            this.scene.primitives.remove(primitive);
            if (!primitive?.isDestroyed()) {
                primitive.destroy();
            }
        });

        // 清除 Entity（点和线使用 Entity API）
        this.entities.forEach((entity) => {
            this.viewer.entities.remove(entity);
        });

        this.entities.length = 0;
        this.fillPrimitives = [];
        this.strokePrimitives = [];
    }

    /**
     * 更新样式
     */
    updateOptions(options: Partial<RenderOptions>) {
        this.options = { ...this.options, ...options };
        // 注意：更新样式需要重新渲染
    }
}
