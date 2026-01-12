interface PostProcessStageEffectOptions {
    shader: string;
    name?: string;
    uniforms?: Record<string, any>;
}

export class SnowEffect {
    shader: PostProcessStageEffectOptions['shader'];
    name: PostProcessStageEffectOptions['name'];
    uniforms: PostProcessStageEffectOptions['uniforms'];

    constructor(options: PostProcessStageEffectOptions) {
        this.shader = options.shader;
        this.name = options.name || 'PostProcessStageEffect';
        this.uniforms = options.uniforms || {};

        if (!this.shader) console.warn('未传入shader');
    }

    createPostProcessStage() {
        const stage = new Cesium.PostProcessStage({
            name: this.name,
            uniforms: this.uniforms,
            fragmentShader: this.shader
        });

        return stage;
    }
}
