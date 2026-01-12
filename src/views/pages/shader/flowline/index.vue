<template>
    <div class="flowline">
        <baseCesiumViewer />
    </div>
</template>

<script setup lang="ts">
import baseCesiumViewer from '@/components/baseCesiumViewer/index.vue';

import { useCesiumViewer } from '@/stores/useCesiumViewer';
import { LineEffect } from '@/utils/cesiumTools/LineEffect';
import shader from '@/shaders/FlowlineEffect.glsl?raw';
import GUI from 'lil-gui';

const store = useCesiumViewer();
const gui = new GUI();

onMounted(() => {
    const lineEffectInstance = new LineEffect({
        lineWidth: 1,
        uniforms: {
            color: Cesium.Color.fromCssColorString('#ff9500'),
            lineCount: 5,
            speed: 1.0,
            glowPower: 0.5
        },
        shader
    });

    // 直接加载geojson
    Cesium.Resource.fetchJson({
        url: '/china-line.geojson'
    })?.then((geojson) => {
        lineEffectInstance.renderGeoJSON(geojson);
        const lines = lineEffectInstance.lines;
        lines.forEach((line) => {
            store.Viewer?.scene.primitives.add(line);
        });
    });

    const material = lineEffectInstance.getMaterial()!;

    const controls = {
        color: '#ff9500',
        alpha: 1,
        lineCount: 10,
        speed: 1,
        glowPower: 1
    };

    gui.addColor(controls, 'color').name('颜色');
    gui.add(controls, 'alpha', 0, 1, 0.01).name('颜色透明度');
    gui.add(controls, 'lineCount', 0, 100, 1).name('单线内流动数量');
    gui.add(controls, 'speed', 0, 10, 0.01).name('扩散速度');
    gui.add(controls, 'glowPower', 0, 1, 0.01).name('辉光强度');

    gui.onChange(() => {
        material.uniforms.color = Cesium.Color.fromCssColorString(controls.color).withAlpha(
            controls.alpha
        );
        material.uniforms.lineCount = controls.lineCount;
        material.uniforms.speed = controls.speed;
        material.uniforms.glowPower = controls.glowPower;
    });
});
</script>

<style scoped lang="scss">
.flowline {
    height: 100%;
}
</style>
