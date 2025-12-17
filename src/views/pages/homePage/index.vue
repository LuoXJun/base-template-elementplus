<template>
    <div class="homePage">
        <baseCesiumViewer />
    </div>
</template>

<script setup lang="ts">
import baseCesiumViewer from '@/components/baseCesiumViewer/index.vue';

import { useCesiumViewer } from '@/stores/useCesiumViewer';
import { RenderGeoJsonByGround } from '@/utils/cesium-utils';

const store = useCesiumViewer();

const loadGeojson = async () => {
    const geoJson = await Cesium.Resource.fetchJson({ url: '/public/geojson.json' });

    const renderer = new RenderGeoJsonByGround(store.Viewer!);
    renderer.renderGeoJSON(geoJson);
};

onMounted(() => {
    loadGeojson();
});
</script>

<style scoped lang="scss">
.homePage {
    height: 100%;
}
</style>
