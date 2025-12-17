// GeoJSON 基础类型定义
type GeoJsonTypes =
    | 'Point'
    | 'MultiPoint'
    | 'LineString'
    | 'MultiLineString'
    | 'Polygon'
    | 'MultiPolygon'
    | 'GeometryCollection'
    | 'Feature'
    | 'FeatureCollection';

// 位置类型 (经度, 纬度, 高度)
type Position = [number, number] | [number, number, number];

// 边界框类型 [minX, minY, minZ, maxX, maxY, maxZ]
type BBox = [number, number, number, number] | [number, number, number, number, number, number];

// 几何对象基接口
interface GeoJsonObject {
    type: GeoJsonTypes;
    bbox?: BBox;
}

// 点几何
interface Point extends GeoJsonObject {
    type: 'Point';
    coordinates: Position;
}

// 多点几何
interface MultiPoint extends GeoJsonObject {
    type: 'MultiPoint';
    coordinates: Position[];
}

// 线串几何
interface LineString extends GeoJsonObject {
    type: 'LineString';
    coordinates: Position[];
}

// 多线串几何
interface MultiLineString extends GeoJsonObject {
    type: 'MultiLineString';
    coordinates: Position[][];
}

// 多边形几何
interface Polygon extends GeoJsonObject {
    type: 'Polygon';
    coordinates: Position[][];
}

// 多多边形几何
interface MultiPolygon extends GeoJsonObject {
    type: 'MultiPolygon';
    coordinates: Position[][][];
}

// 多多边形几何
interface GeometryCollection extends GeoJsonObject {
    type: 'GeometryCollection';
    coordinates: Position[][][];
}

// 所有几何类型的联合
type Geometry =
    | Point
    | MultiPoint
    | LineString
    | MultiLineString
    | Polygon
    | MultiPolygon
    | GeometryCollection;

// 几何集合
interface GeometryCollection extends GeoJsonObject {
    type: 'GeometryCollection';
    geometries: Geometry[];
}

// 特征 (要素)
interface Feature<T extends Geometry = Geometry> extends GeoJsonObject {
    type: 'Feature';
    geometry: T | null;
    properties: { [key: string]: any } | null;
    id?: string | number;
}

// 特征集合
interface FeatureCollection<T extends Geometry = Geometry> extends GeoJsonObject {
    type: 'FeatureCollection';
    features: Feature<T>[];
}

// 所有 GeoJSON 对象的联合类型
type GeoJSON = Geometry | Feature | FeatureCollection | GeometryCollection;

// Cesium相关

/**绘制几何类型*/
type GeometryType = 'rectangle' | 'polygon' | 'line' | 'point';

/**获取鼠标事件对应的key*/
type ScreenSpaceEventTypeKey = keyof typeof Cesium.ScreenSpaceEventType;

/**获取鼠标事件对应的值*/
type ScreenSpaceEventTypeValue =
    (typeof Cesium.ScreenSpaceEventType)[keyof typeof Cesium.ScreenSpaceEventType];
