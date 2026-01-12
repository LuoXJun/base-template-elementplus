<template>
    <div class="radar">
        <baseCesiumViewer />
    </div>
</template>

<script setup lang="ts">
import baseCesiumViewer from '@/components/baseCesiumViewer/index.vue';

import { useCesiumViewer } from '@/stores/useCesiumViewer';
import { SquareEffect } from '@/utils/cesiumTools/SquareEffect';
import shader from '@/shaders/RadarEffEct.glsl?raw';
import GUI from 'lil-gui';

const store = useCesiumViewer();
const gui = new GUI();

onMounted(() => {
    const squareEffectInstance = new SquareEffect({
        shader,
        uniforms: {
            uBaseColor: Cesium.Color.RED,
            uShowLine: true,
            uLineWidth: 0.03,
            uSpeed: 0.2,
            uRingCount: 6
        }
    });

    const rectangle = squareEffectInstance.createRectangle();
    const material = squareEffectInstance.getMaterial()!;

    store.Viewer?.scene.primitives.add(rectangle);

    const controls = {
        color: '#ff0000',
        alpha: 1,
        showLine: true,
        lineWidth: 0.03,
        count: 6,
        speed: 0.2,
        add() {}
    };

    gui.add(controls, 'add').name('添加');
    gui.add(controls, 'showLine').name('显示扫描线');
    gui.addColor(controls, 'color').name('颜色');
    gui.add(controls, 'alpha', 0, 1, 0.01).name('颜色透明度');
    gui.add(controls, 'lineWidth', 0, 1, 0.01).name('宽度');
    gui.add(controls, 'count', 0, 20, 1).name('波纹数量');
    gui.add(controls, 'speed', 0, 1, 0.01).name('扩散速度');

    gui.onChange(() => {
        material.uniforms.uBaseColor = Cesium.Color.fromCssColorString(controls.color).withAlpha(
            controls.alpha
        );
        material.uniforms.uShowLine = controls.showLine;
        material.uniforms.uLineWidth = controls.lineWidth;
        material.uniforms.uRingCount = controls.count;
        material.uniforms.uSpeed = controls.speed;
    });
});
</script>

<style scoped lang="scss">
.radar {
    height: 100%;
}
</style>
