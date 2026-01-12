<template>
    <div class="rain">
        <baseCesiumViewer />
    </div>
</template>

<script setup lang="ts">
import baseCesiumViewer from '@/components/baseCesiumViewer/index.vue';

import { useCesiumViewer } from '@/stores/useCesiumViewer';
import { PostProcessStageEffect } from '@/utils/cesiumTools/PostProcessStageEffect';
import shader from '@/shaders/RainEffect.glsl?raw';
import GUI from 'lil-gui';

const store = useCesiumViewer();
onMounted(() => {
    const instance = new PostProcessStageEffect({
        uniforms: {
            tiltAngle: 0.1,
            rainSize: 0.1,
            rainSpeed: 0.2,
            rainDensity: 5
        },
        shader
    });

    const stage = instance.createPostProcessStage();

    store.Viewer?.postProcessStages.add(stage);
});
</script>

<style scoped lang="scss">
.rain {
    height: 100%;
}
</style>
