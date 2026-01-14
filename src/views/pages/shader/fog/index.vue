<template>
    <div class="fog">
        <baseCesiumViewer />
    </div>
</template>

<script setup lang="ts">
import baseCesiumViewer from '@/components/baseCesiumViewer/index.vue';

import { useCesiumViewer } from '@/stores/useCesiumViewer';
import shader from '@/shaders/FogEffect.js';
import GUI from 'lil-gui';
import { resolveIncludes } from '@/utils/cesiumTools/shaderChunk';
const gui = new GUI();

const store = useCesiumViewer();
onMounted(() => {
    store.Viewer?.camera.flyTo({
        destination: new Cesium.Cartesian3(
            -1635117.0284874607,
            5477987.653236552,
            2826439.5398477674
        ),
        orientation: {
            heading: 1.051247845326408,
            pitch: -0.28721518392425693,
            roll: 6.283137361665023
        }
    });

    const controls = {
        splitX: 1,
        u_globalDensity: 0.6,
        u_fogHeight: 1273,
        fogColorAlpha: 0.5,
        fogColor: '#fff'
    };

    const stage = new Cesium.PostProcessStage({
        uniforms: {
            ...controls,
            fogColor: Cesium.Color.fromCssColorString(controls.fogColor)
        },
        fragmentShader: resolveIncludes(shader)
    });
    store.Viewer?.postProcessStages.add(stage);

    gui.add(controls, 'splitX', 0, 1, 0.01).name('分界线');
    gui.add(controls, 'u_globalDensity', 0, 1, 0.01).name('雾密度');
    gui.add(controls, 'u_fogHeight', 0, 5000, 0.1).name('雾高度');
    gui.addColor(controls, 'fogColor').name('雾颜色');
    gui.add(controls, 'fogColorAlpha', 0, 1).name('雾透明度');

    gui.onChange(() => {
        for (const key in controls) {
            if (key === 'fogColor') {
                stage.uniforms['fogColor'] = Cesium.Color.fromCssColorString(
                    controls['fogColor']
                ).withAlpha(controls.fogColorAlpha);
            } else {
                // @ts-ignore
                stage.uniforms[key] = controls[key];
            }
        }
    });
});

onUnmounted(() => {
    gui.destroy();
});
</script>

<style scoped lang="scss">
.fog {
    height: 100%;
}
</style>
