<template>
    <div class="homePage">
        <baseCesiumViewer />
    </div>
</template>

<script setup lang="ts">
import baseCesiumViewer from '@/components/baseCesiumViewer/index.vue';

import { useCesiumViewer } from '@/stores/useCesiumViewer';
import { createRectangleByCenter } from '@/utils/cesiumTools/RadarEffect';

const store = useCesiumViewer();

onMounted(() => {
    // 使用示例
    const center = Cesium.Cartesian3.fromDegrees(116.397, 39.909, 0); // 北京中心
    const radiusDegrees = 0.5; // 约5.5公里半径

    const rectangle = createRectangleByCenter(center, radiusDegrees);

    store.Viewer!.scene.primitives.add(rectangle);
});
</script>

<style scoped lang="scss">
.homePage {
    height: 100%;
}
</style>
