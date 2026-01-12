<template>
    <div class="snow">
        <baseCesiumViewer />
    </div>
</template>

<script setup lang="ts">
import baseCesiumViewer from '@/components/baseCesiumViewer/index.vue';

import { useCesiumViewer } from '@/stores/useCesiumViewer';
import shader from '@/shaders/snowEffect/image.glsl?raw';
import GUI from 'lil-gui';
const gui = new GUI();

const store = useCesiumViewer();
onMounted(() => {
    const controls = {
        uvBias: new Cesium.Cartesian2(-7e-7, -0.00001572),
        splitX: 1,
        maxDistance: 1e5,
        snowThickness: 0.41,
        skyCoverage: 0.5,
        coverSky: true,
        showCover: true,
        snowSpeed: 2,
        showParticles: true,
        snowDensity: 1,
        // 通过深度来控制表达雪颗粒的大小
        snowSize: 1,
        // 切换雪花形状
        styleType: 1
    };

    const stage = new Cesium.PostProcessStage({
        uniforms: controls,
        fragmentShader: shader
    });
    store.Viewer?.postProcessStages.add(stage);

    gui.add(controls, 'splitX', 0, 1, 0.01).name('分界线');
    gui.add(controls, 'snowThickness', 0, 1, 0.01).name('积雪密度');
    gui.add(controls, 'skyCoverage', 0, 1, 0.1).name('天空覆盖度');
    gui.add(controls, 'coverSky').name('是否覆盖天空');
    gui.add(controls, 'showCover').name('显示积雪');
    gui.add(controls, 'showParticles').name('下雪特效');
    gui.add(controls, 'snowSpeed', 0, 10, 0.1).name('雪落速度');
    gui.add(controls, 'snowDensity', 0, 1, 0.1).name('下雪密度');
    gui.add(controls, 'snowSize', 0, 1, 0.1).name('雪尺寸');

    gui.onChange(() => {
        for (const key in controls) {
            // @ts-ignore
            stage.uniforms[key] = controls[key];
        }
    });
});
</script>

<style scoped lang="scss">
.snow {
    height: 100%;
}
</style>
