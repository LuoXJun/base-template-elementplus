const lineColor = Cesium.Color.fromCssColorString('#f5ad47');
const fillColor = Cesium.Color.CYAN.withAlpha(0.4);
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
        if (!geometry) return;

        try {
            switch (geometry.type) {
                case 'Point':
                    await this.renderPoint(geometry.coordinates, properties);
                    break;
                case 'MultiPoint':
                    for (const coord of geometry.coordinates) {
                        await this.renderPoint(coord, properties);
                    }
                    break;
                case 'LineString':
                    await this.renderLineString(geometry.coordinates, properties);
                    break;
                case 'MultiLineString':
                    for (const line of geometry.coordinates) {
                        await this.renderLineString(line, properties);
                    }
                    break;
                case 'Polygon':
                    await this.renderPolygon(geometry.coordinates, properties);
                    break;
                case 'MultiPolygon':
                    for (const polygon of geometry.coordinates) {
                        await this.renderPolygon(polygon, properties);
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
        } catch (error) {
            console.error(`渲染要素时出错:`, error, feature);
        }
    }

    /**
     * 渲染点
     */
    private async renderPoint(coordinates: number[], properties: any) {
        if (coordinates.length < 2) return;

        const [lon, lat, height = 0] = coordinates;

        // 使用 Entity API 渲染点
        const point = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
            point: {
                pixelSize: this.options.pointSize,
                color: this.options.pointColor,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: lineWidth
            },
            label: properties.name
                ? {
                      text: properties.name,
                      font: '12px sans-serif',
                      pixelOffset: new Cesium.Cartesian2(0, -15)
                  }
                : undefined
        });

        this.entities.push(point);
    }

    /**
     * 渲染线
     */
    private async renderLineString(coordinates: number[][], properties: any) {
        if (coordinates.length < 2) return;

        // 转换坐标
        const positions = coordinates.map((coord) => {
            const [lon, lat, height = 0] = coord;
            return Cesium.Cartesian3.fromDegrees(lon, lat, height);
        });

        // 使用 Entity API 渲染线
        const line = this.viewer.entities.add({
            polyline: {
                positions: positions,
                width: this.options.polylineWidth,
                material: this.options.polylineColor,
                clampToGround: true
            },
            properties: properties
        });

        this.entities.push(line);
    }

    /**
     * 渲染多边形
     */
    private async renderPolygon(coordinates: number[][][], properties: any) {
        if (!coordinates || coordinates.length === 0) return;

        try {
            // 1. 渲染填充面
            const fillPrimitive = await this.createFillPrimitive(coordinates, properties);
            if (fillPrimitive) {
                this.fillPrimitives.push(fillPrimitive);
            }

            // 2. 渲染边框
            const rings = this.extractRings(coordinates);

            for (let i = 0; i < rings.length; i++) {
                const isHole = i > 0;

                // 检查是否渲染内环边框
                if (isHole && !this.options.strokeHoles) {
                    continue;
                }

                const strokePrimitive = this.createStrokePrimitive(rings[i], `${Date.now()}-${i}`);
                if (strokePrimitive) {
                    this.strokePrimitives.push(strokePrimitive);
                }
            }
        } catch (error) {
            console.error('渲染多边形时出错:', error, coordinates);
        }
    }

    /**
     * 创建填充 Primitive
     */
    private async createFillPrimitive(
        coordinates: number[][][],
        properties: any
    ): Promise<Cesium.GroundPrimitive | null> {
        try {
            const hierarchy = this.createPolygonHierarchy(coordinates);

            // 验证层级是否有效
            if (!hierarchy.positions || hierarchy.positions.length < 3) {
                console.warn('多边形顶点不足，跳过渲染');
                return null;
            }

            const primitive = new Cesium.GroundPrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: new Cesium.PolygonGeometry({
                        polygonHierarchy: hierarchy,
                        height: 0,
                        perPositionHeight: false
                    }),
                    id: properties.id || `polygon-${Date.now()}`,
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                            this.options.fillColor
                        )
                    }
                }),
                appearance: new Cesium.PerInstanceColorAppearance({
                    translucent: this.options.fillColor.alpha < 1.0,
                    closed: true
                }),
                classificationType: Cesium.ClassificationType.BOTH,
                //  设置为异步创建
                asynchronous: true
            });

            this.scene.primitives.add(primitive);
            return primitive;
        } catch (error) {
            console.error('创建填充 Primitive 时出错:', error);
            return null;
        }
    }

    /**
     * 创建边框 Primitive
     */
    private createStrokePrimitive(
        ring: number[][],
        id: string
    ): Cesium.GroundPolylinePrimitive | null {
        try {
            // 确保环是有效的
            if (!ring || ring.length < 2) {
                console.warn('环点数不足，跳过边框渲染');
                return null;
            }

            // 处理环：移除高度信息并确保是有效的经纬度
            const cleanedRing = ring.map((coord) => {
                // 只取前两个值（经度、纬度）
                const [lon, lat] = coord;

                // 验证经纬度是否有效
                if (typeof lon !== 'number' || typeof lat !== 'number') {
                    throw new Error(`无效的坐标值: ${coord}`);
                }

                // 检查经纬度范围
                if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
                    console.warn(`坐标超出正常范围: ${lon}, ${lat}`);
                }

                return [lon, lat];
            });

            // 创建不闭合的环（移除最后一个点如果是闭合的）
            let unclosedRing = cleanedRing;
            const first = cleanedRing[0];
            const last = cleanedRing[cleanedRing.length - 1];

            // 如果环是闭合的（首尾相同），移除最后一个点
            if (
                cleanedRing.length > 2 &&
                Math.abs(first[0] - last[0]) < 0.000001 &&
                Math.abs(first[1] - last[1]) < 0.000001
            ) {
                unclosedRing = cleanedRing.slice(0, -1);
            }

            // 确保至少有两个点
            if (unclosedRing.length < 2) {
                console.warn('处理后环点数不足，跳过边框渲染');
                return null;
            }

            // 转换为 Cartesian3 数组
            const positions = Cesium.Cartesian3.fromDegreesArray(unclosedRing.flat());

            // 验证 positions
            if (!positions || positions.length < 2) {
                console.warn('无法创建有效的 positions 数组');
                return null;
            }

            const primitive = new Cesium.GroundPolylinePrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: new Cesium.GroundPolylineGeometry({
                        positions: positions,
                        width: this.options.strokeWidth,
                        loop: true
                    }),
                    id: id,
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                            this.options.strokeColor
                        )
                    }
                }),
                appearance: new Cesium.PolylineColorAppearance(),
                asynchronous: true
            });

            this.scene.primitives.add(primitive);
            return primitive;
        } catch (error) {
            console.error('创建边框 Primitive 时出错:', error, ring);
            return null;
        }
    }

    /**
     * 创建多边形层级结构
     */
    private createPolygonHierarchy(coordinates: number[][][]): Cesium.PolygonHierarchy {
        if (!coordinates || coordinates.length === 0) {
            return new Cesium.PolygonHierarchy([]);
        }

        // 处理外环
        const outerRing = coordinates[0];
        const outerPositions = this.convertRingToCartesian3(outerRing);

        const hierarchy = new Cesium.PolygonHierarchy(outerPositions);

        // 处理内环（洞）
        if (coordinates.length > 1) {
            for (let i = 1; i < coordinates.length; i++) {
                const hole = coordinates[i];
                const holePositions = this.convertRingToCartesian3(hole);

                if (holePositions.length >= 3) {
                    hierarchy.holes.push(new Cesium.PolygonHierarchy(holePositions));
                }
            }
        }

        return hierarchy;
    }

    /**
     * 转换环为 Cartesian3 数组
     */
    private convertRingToCartesian3(ring: number[][]): Cesium.Cartesian3[] {
        if (!ring || ring.length === 0) {
            return [];
        }

        // 清理环数据：只取经纬度，确保环闭合
        const cleanedCoords: number[] = [];

        for (const coord of ring) {
            const [lon, lat] = coord.slice(0, 2); // 只取前两个值

            // 验证坐标
            if (typeof lon === 'number' && typeof lat === 'number') {
                cleanedCoords.push(lon, lat);
            }
        }

        // 如果环未闭合，添加第一个点使其闭合
        if (cleanedCoords.length >= 4) {
            const firstLon = cleanedCoords[0];
            const firstLat = cleanedCoords[1];
            const lastLon = cleanedCoords[cleanedCoords.length - 2];
            const lastLat = cleanedCoords[cleanedCoords.length - 1];

            // 检查是否闭合
            const tolerance = 0.000001;
            const isClosed =
                Math.abs(firstLon - lastLon) < tolerance &&
                Math.abs(firstLat - lastLat) < tolerance;

            if (!isClosed) {
                cleanedCoords.push(firstLon, firstLat);
            }
        }

        try {
            return Cesium.Cartesian3.fromDegreesArray(cleanedCoords);
        } catch (error) {
            console.error('转换坐标时出错:', error, ring);
            return [];
        }
    }

    /**
     * 提取所有环
     */
    private extractRings(coordinates: number[][][]): number[][][] {
        return coordinates.map((ring) => {
            // 清理环数据：只保留经纬度
            return ring.map((coord) => coord.slice(0, 2));
        });
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
            if (!primitive.isDestroyed()) {
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

/**
 * @description 绘制几何
 * */
export class DrawGeometry {
    private options: RenderOptions;
    private pts: Cesium.Cartesian3[] = [];

    //动态点,鼠标位置
    private lastPoint = new Cesium.Cartesian3();
    private lastPointLonlat = new Cesium.Cartographic();
    private firstPointLonlat = new Cesium.Cartographic();
    private viewer: Cesium.Viewer;
    // 动态entity,绘制结束后清除
    private dynamicEntity: Cesium.Entity | undefined;
    private type: GeometryType;
    private entities: Cesium.Entity[] = [];

    west: number = 0;
    south: number = 0;
    east: number = 0;
    north: number = 0;

    handler: Cesium.ScreenSpaceEventHandler;

    constructor(
        viewer: Cesium.Viewer,
        handler: Cesium.ScreenSpaceEventHandler,
        options?: Partial<RenderOptions>
    ) {
        this.viewer = viewer;
        this.handler = handler;
        this.type = 'line';

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

    draw(type: GeometryType) {
        if (!this.viewer) return alert('找不到viewer');
        this.type = type;

        let { handler, viewer, options } = this;

        handler.setInputAction((e: any) => {
            const p = viewer.scene.pickPosition(e.position);
            const lonlng = Cesium.Cartographic.fromCartesian(p);

            if (type === 'point') {
                const entity = viewer.entities.add({
                    name: type,
                    position: p,
                    point: {
                        pixelSize: 10,
                        color: options.fillColor,
                        outlineColor: options.strokeColor,
                        outlineWidth: options.strokeWidth,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    },
                    label: {
                        text: `${Cesium.Math.toDegrees(lonlng.longitude)},${Cesium.Math.toDegrees(lonlng.latitude)},${lonlng.height}`,
                        pixelOffset: new Cesium.Cartesian2(0, -30),
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                    }
                });
                this.entities.push(entity);
            }

            if (type === 'line') {
                this.pts.push(p);

                if (!this.dynamicEntity || !viewer.entities.contains(this.dynamicEntity)) {
                    this.dynamicEntity = viewer.entities.add({
                        name: type,
                        polyline: {
                            positions: new Cesium.CallbackProperty(() => {
                                return [...this.pts, this.lastPoint];
                            }, false),
                            width: options.strokeWidth,
                            material: options.strokeColor,
                            clampToGround: true,
                            classificationType: Cesium.ClassificationType.BOTH
                        }
                    });
                }
            }
            if (type === 'polygon') {
                this.pts.push(p);

                if (!this.dynamicEntity || !viewer.entities.contains(this.dynamicEntity)) {
                    this.dynamicEntity = viewer.entities.add({
                        name: type,
                        polygon: {
                            hierarchy: new Cesium.CallbackProperty(() => {
                                const positions = [...this.pts, this.lastPoint];

                                return new Cesium.PolygonHierarchy(positions);
                            }, false),
                            material: options.fillColor,
                            classificationType: Cesium.ClassificationType.BOTH
                        },
                        polyline: {
                            positions: new Cesium.CallbackProperty(() => {
                                return [...this.pts, this.lastPoint, this.pts[0]];
                            }, false),
                            width: options.strokeWidth,
                            material: options.strokeColor,
                            clampToGround: true,
                            classificationType: Cesium.ClassificationType.BOTH
                        }
                    });
                }
            }
            if (type === 'rectangle') {
                this.pts.push(p);

                if (this.pts.length === 2) return this.inTheFinally();

                if (!this.dynamicEntity || !viewer.entities.contains(this.dynamicEntity)) {
                    this.dynamicEntity = viewer.entities.add({
                        rectangle: {
                            coordinates: new Cesium.CallbackProperty(() => {
                                Cesium.Cartographic.fromCartesian(
                                    this.lastPoint,
                                    undefined,
                                    this.lastPointLonlat
                                );
                                Cesium.Cartographic.fromCartesian(
                                    this.pts[0],
                                    undefined,
                                    this.firstPointLonlat
                                );
                                // 计算矩形范围
                                this.west = Math.min(
                                    this.firstPointLonlat.longitude,
                                    this.lastPointLonlat.longitude
                                );
                                this.south = Math.min(
                                    this.firstPointLonlat.latitude,
                                    this.lastPointLonlat.latitude
                                );
                                this.east = Math.max(
                                    this.firstPointLonlat.longitude,
                                    this.lastPointLonlat.longitude
                                );
                                this.north = Math.max(
                                    this.firstPointLonlat.latitude,
                                    this.lastPointLonlat.latitude
                                );

                                return Cesium.Rectangle.fromRadians(
                                    this.west,
                                    this.south,
                                    this.east,
                                    this.north
                                );
                            }, false),
                            material: options.fillColor
                        },
                        polyline: {
                            positions: new Cesium.CallbackProperty(() => {
                                if (this.dynamicEntity?.rectangle) {
                                    const positions = Cesium.Rectangle.subsample(
                                        Cesium.Rectangle.fromRadians(
                                            this.west,
                                            this.south,
                                            this.east,
                                            this.north
                                        )
                                    );

                                    return [...positions, positions[0]];
                                }

                                return [...this.pts, this.lastPoint];
                            }, false),
                            width: options.strokeWidth,
                            material: options.strokeColor,
                            clampToGround: true,
                            classificationType: Cesium.ClassificationType.BOTH
                        }
                    });
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 获取当前鼠标位置
        handler.setInputAction((e: any) => {
            const p = viewer.scene.pickPosition(e.endPosition);
            Cesium.Cartesian3.clone(p, this.lastPoint);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(() => {
            this.inTheFinally();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    // 结束当前绘制
    inTheFinally() {
        let { viewer, pts, east, west, north, south, type, options } = this;
        // 结束绘制时清除动态entity并添加最终entity
        if (this.dynamicEntity) {
            viewer.entities.remove(this.dynamicEntity);
            this.dynamicEntity = undefined;
        }

        if (type === 'line' && pts.length >= 2) {
            const entity = viewer.entities.add({
                name: type,
                polyline: {
                    positions: [...pts],
                    width: options.strokeWidth,
                    material: options.strokeColor,
                    clampToGround: true,
                    classificationType: Cesium.ClassificationType.BOTH
                }
            });

            this.entities.push(entity);
        }

        if (type === 'polygon' && pts.length > 2) {
            const entity = viewer.entities.add({
                name: type,
                polygon: {
                    hierarchy: [...pts],
                    material: options.fillColor,
                    classificationType: Cesium.ClassificationType.BOTH
                },
                polyline: {
                    positions: [...pts, pts[0]],
                    width: options.strokeWidth,
                    material: options.strokeColor,
                    clampToGround: true,
                    classificationType: Cesium.ClassificationType.BOTH
                }
            });
            this.entities.push(entity);
        }

        if (type === 'rectangle' && pts.length === 2) {
            const positions = Cesium.Rectangle.subsample(
                Cesium.Rectangle.fromRadians(west, south, east, north)
            );

            const entity = viewer.entities.add({
                name: type,
                rectangle: {
                    coordinates: Cesium.Rectangle.fromCartesianArray([pts[0], pts[1]]),
                    material: options.fillColor
                },
                polyline: {
                    positions: [...positions, positions[0]],
                    width: options.strokeWidth,
                    material: options.strokeColor,
                    clampToGround: true,
                    classificationType: Cesium.ClassificationType.BOTH
                }
            });
            this.entities.push(entity);
        }

        pts.length = 0;
    }
    clear() {
        if (!this.viewer) return alert('找不到viewer');
        this.entities.forEach((entity) => {
            this.viewer.entities.remove(entity);
        });

        this.entities.length = 0;
    }
}

// 去除geojson中的高度信息
export const removeHeightFromGeoJSON = (geoJson: FeatureCollection) => {
    function processCoordinates(coords: Geometry['coordinates']): Geometry['coordinates'] {
        if (Array.isArray(coords)) {
            if (typeof coords[0] === 'number') {
                return [coords[0], coords[1]] as Position;
            } else {
                // @ts-ignore
                return coords.map(processCoordinates);
            }
        }

        return coords;
    }

    const processed: FeatureCollection | Feature = JSON.parse(JSON.stringify(geoJson));

    if (processed.type === 'FeatureCollection') {
        processed.features.forEach((feature) => {
            if (feature.geometry) {
                feature.geometry.coordinates = processCoordinates(feature.geometry.coordinates);
            }
        });
    } else if (processed.type === 'Feature') {
        if (!processed.geometry) return;
        processed.geometry.coordinates = processCoordinates(processed.geometry.coordinates);
    }

    return processed;
};
