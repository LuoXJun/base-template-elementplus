namespace Cesium {
    export * from 'cesium';

    export type TAnyPrimitive =
        | Primitive
        | GroundPrimitive
        | GroundPolylinePrimitive
        | ClassificationPrimitive
        | DebugModelMatrixPrimitive
        | Polyline
        | PointPrimitiveCollection
        | Model
        | BillboardCollection
        | LabelCollection;
}
