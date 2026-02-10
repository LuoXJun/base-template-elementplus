import * as Cesium from 'cesium';
import waterVS from '@/shaders/water/waterVS';
import waterFS from '@/shaders/water/waterFS';
import Common from '@/shaders/water/common';

export default class CreateWater extends Cesium.Primitive {
    constructor(options) {
        super();
        this.viewer = options.viewer;
        this.positions = options.positions;
        this.maxElevation = options.maxElevation;
        this.minElevation = options.minElevation;
        this.heightMap = options.canvas;
        this.noise = options.noise;

        this.coast2water_fadedepth = 0.1;
        this.large_waveheight = 0.5; // change to adjust the "heavy" waves
        this.large_wavesize = 4; // factor to adjust the large wave size
        this.small_waveheight = 0.9; // change to adjust the small random waves
        this.small_wavesize = 0.12; // factor to ajust the small wave size
        this.water_softlight_fact = 36; // range [1..200] (should be << smaller than glossy-fact)
        this.water_glossylight_fact = 120; // range [1..200]
        this.particle_amount = 70;
        this.WATER_LEVEL = 0.34;
        this._showLines = false;

        this.resolution = Cesium.defaultValue(
            options.resolution,
            new Cesium.Cartesian2(1024, 1024)
        );
    }
    createCommand(context) {
        const polygon = new Cesium.PolygonGeometry({
            ellipsoid: Cesium.Ellipsoid.WGS84,
            polygonHierarchy: new Cesium.PolygonHierarchy(this.positions),
            height: this.minElevation,
            vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
            // granularity: Cesium.Math.toRadians(0.0001) // 调整这个参数以增加顶点密度
        });

        const geometry = Cesium.PolygonGeometry.createGeometry(polygon);

        const attributeLocations = Cesium.GeometryPipeline.createAttributeLocations(geometry);

        const va = Cesium.VertexArray.fromGeometry({
            context: context,
            geometry: geometry,
            attributeLocations: attributeLocations
        });
        const vs = waterVS;
        const fs = waterFS;

        const shaderProgram = Cesium.ShaderProgram.fromCache({
            context: context,
            vertexShaderSource: Common + vs,
            fragmentShaderSource: Common + fs,
            attributeLocations: attributeLocations
        });
        const texture = new Cesium.Texture({
            context: context,
            width: 2048.0,
            height: 2048.0,
            pixelFormat: Cesium.PixelFormat.RGBA,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
            flipY: true,
            sampler: new Cesium.Sampler({
                minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
                magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR,
                wrapS: Cesium.TextureWrap.REPEAT,
                wrapT: Cesium.TextureWrap.REPEAT
            }),
            source: this.heightMap
        });
        const noise = new Cesium.Texture({
            context: context,
            width: 512.0,
            height: 512.0,
            pixelFormat: Cesium.PixelFormat.RGBA,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
            flipY: true,
            sampler: new Cesium.Sampler({
                minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
                magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR,
                wrapS: Cesium.TextureWrap.REPEAT,
                wrapT: Cesium.TextureWrap.REPEAT
            }),
            source: this.noise
        });
        const uniformMap = {
            heightMap: () => {
                return texture;
            },
            heightScale: () => 1.0,
            minElevation: () => this.minElevation,
            maxElevation: () => this.maxElevation,
            iTime: () => this.time,
            iChannel0: () => noise,
            coast2water_fadedepth: () => this.coast2water_fadedepth,
            large_waveheight: () => this.large_waveheight, // change to adjust the "heavy" waves
            large_wavesize: () => this.large_wavesize, // factor to adjust the large wave size
            small_waveheight: () => this.small_waveheight, // change to adjust the small random waves
            small_wavesize: () => this.small_wavesize, // factor to ajust the small wave size
            water_softlight_fact: () => this.water_softlight_fact, // range [1..200] (should be << smaller than glossy-fact)
            water_glossylight_fact: () => this.water_glossylight_fact, // range [1..200]
            particle_amount: () => this.particle_amount,
            WATER_LEVEL: () => this.WATER_LEVEL
        };
        const renderState = Cesium.RenderState.fromCache({
            depthTest: { enabled: true },
            depthMask: { enabled: true },
            blending: Cesium.BlendingState.ALPHA_BLEND,
            cull: {
                enabled: false
            }
        });
        this.drawCommand = new Cesium.DrawCommand({
            modelMatrix: this.modelMatrix,
            vertexArray: va,
            primitiveType: Cesium.PrimitiveType.TRIANGLES, //TRIANGLES LINES
            shaderProgram: shaderProgram,
            uniformMap: uniformMap,
            renderState: renderState,
            pass: Cesium.Pass.OPAQUE
        });
    }
    set showLines(value) {
        this._showLines = value;
        this.drawCommand.primitiveType = this._showLines
            ? Cesium.PrimitiveType.LINES
            : Cesium.PrimitiveType.TRIANGLES;
    }
    get showLines() {
        return this._showLines;
    }
    async update(frameState) {
        const now = performance.now();
        this.deltaTime = (now - this.lastUpdateTime) / 1000.0; // 转换为秒
        this.lastUpdateTime = now;
        this.time = now / 1000;
        this.frame += 0.02;
        if (!this.drawCommand) {
            this.createCommand(frameState.context);
        }
        frameState.commandList.push(this.drawCommand);
    }
    destroy() {
        super.destroy();
        const commondList = [this.drawCommand];
        commondList.forEach((drawCommand) => {
            if (drawCommand) {
                const va = drawCommand.vertexArray,
                    sp = drawCommand.shaderProgram;
                if (!va.isDestroyed()) va.destroy();
                if (!sp.isDestroyed || !sp.isDestroyed()) {
                    sp.destroy();
                }
                drawCommand.isDestroyed = function returnTrue() {
                    return true;
                };
                drawCommand.uniformMap = undefined;
                drawCommand.renderState = Cesium.RenderState.removeFromCache(
                    drawCommand.renderState
                );
            }
        });
        this.drawCommand = null;
    }
}
