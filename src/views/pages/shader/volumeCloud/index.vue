<template>
    <div class="volumeCloud">
        <baseCesiumViewer />
    </div>
</template>

<script setup lang="ts">
import baseCesiumViewer from '@/components/baseCesiumViewer/index.vue';

import { useCesiumViewer } from '@/stores/useCesiumViewer';
import shader from '@/shaders/volumeCloudEffect.js';
import GUI from 'lil-gui';
import { resolveIncludes } from '@/utils/cesiumTools/shaderChunk';
import { getImageWidthName2noise } from '@/utils/getAssets';
const gui = new GUI();

const store = useCesiumViewer();
onMounted(() => {
    // store.Viewer?.camera.flyTo({
    //     destination: new Cesium.Cartesian3(
    //         -1635117.0284874607,
    //         5477987.653236552,
    //         2826439.5398477674
    //     ),
    //     orientation: {
    //         heading: 1.051247845326408,
    //         pitch: -0.28721518392425693,
    //         roll: 6.283137361665023
    //     }
    // });

    const a = Cesium.Cartographic.fromCartesian(
        new Cesium.Cartesian3(-1656821.8401090836, 5482982.659597231, 2824025.2982036923)
    );

    let uniforms = {
        cloudCover: 0.45,
        // cloudBase: 2000,
        // cloudTop: 6000,
        cloudBase: 16190,
        cloudTop: 30190,
        cloudThickness: 4e3,
        cloudBaseRadius: 6378137 + 2000,
        cloudTopRadius: 6378137 + 10000,
        currentWindVectorWC: new Cesium.Cartesian3(100, 0, 0)
    };

    const stage = new Cesium.PostProcessStage({
        uniforms: {
            iChannel1: getImageWidthName2noise('iChannel1.png'),
            blueNoise: getImageWidthName2noise('blueNoise.png'),
            iChannel2: getImageWidthName2noise('iChannel2.png'),
            Perlin: getImageWidthName2noise('Perlin.png'),
        },
        fragmentShader: resolveIncludes(shader)
    });

    store.Viewer?.postProcessStages.add(stage);
});

onUnmounted(() => {
    gui.destroy();
});
</script>

<style scoped lang="scss">
.volumeCloud {
    height: 100%;
}
</style>
