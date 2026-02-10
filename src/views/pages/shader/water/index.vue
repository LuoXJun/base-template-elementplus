<template>
    <div class="water">
        <baseCesiumViewer />
    </div>
</template>

<script setup lang="ts">
import baseCesiumViewer from '@/components/baseCesiumViewer/index.vue';
import { useCesiumViewer } from '@/stores/useCesiumViewer';
import { getImageWidthName2noise, getImageWidthName2normals } from '@/utils/getAssets';
import CreateWater from '@/utils/cesiumTools/createWater';

const store = useCesiumViewer();

onMounted(async () => {
    const pts = [
        {
            x: -789722.8959434574,
            y: 5461081.52263631,
            z: 3188267.6512489263
        },
        {
            x: -1254047.9830771987,
            y: 5389688.212478006,
            z: 3160999.1672942964
        },
        {
            x: -1287074.13113426,
            y: 5570483.488780364,
            z: 2817848.8311908566
        },
        {
            x: -633160.3798775575,
            y: 5700944.521330925,
            z: 2779729.429356079
        },
        {
            x: -875949.0783746801,
            y: 5626207.825543681,
            z: 2864234.7232714286
        },
        {
            x: -661163.4784016993,
            y: 5545138.91284455,
            z: 3071052.94987448
        },
        {
            x: -924954.6670390054,
            y: 5496944.44777621,
            z: 3089396.050364451
        }
    ];

    const positions = pts.map((v) => new Cesium.Cartesian3(v.x, v.y, v.z));

    const canvas = await Cesium.Resource.fetchImage({
        url: getImageWidthName2normals('texture2.png')
    });
    const noise = await Cesium.Resource.fetchImage({
        url: getImageWidthName2noise('iChannel1.png')
    });
    const water = new CreateWater({
        viewer: store.Viewer,
        positions,
        minElevation: 10000,
        maxElevation: 20000,
        canvas,
        noise
    });

    store.Viewer!.scene.primitives.add(water);
});
</script>

<style scoped lang="scss">
.water {
    height: 100%;
}
</style>
