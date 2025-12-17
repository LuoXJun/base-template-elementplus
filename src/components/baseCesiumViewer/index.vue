<template>
    <div class="baseCesiumViewer">
        <div id="baseCesiumViewer"></div>
        <div class="baseViewer-toolsBar">
            <toolsBar />
        </div>
    </div>
</template>

<script setup lang="ts">
import toolsBar from './components/toolsBar.vue';
import { useCesiumViewer } from '@/stores/useCesiumViewer';
const store = useCesiumViewer();

const initHandler = (viewer: Cesium.Viewer): Cesium.ScreenSpaceEventHandler => {
    return new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
};

const init = async () => {
    // 初始化场景
    const viewer = new Cesium.Viewer('baseCesiumViewer', {
        geocoder: false, //是否显示geocoder小器件，右上角查询按钮
        homeButton: false, //是否显示Home按钮
        sceneModePicker: false, //是否显示3D/2D选择器
        fullscreenButton: false,
        vrButton: false, //VR模式
        baseLayerPicker: false, //是否显示图层选择器
        infoBox: false, //是否显示信息框
        selectionIndicator: false,
        animation: false, //是否创建动画小器件，左下角仪表
        timeline: false, //是否显示时间轴
        shouldAnimate: false, //是否显示动画
        navigationHelpButton: false //是否显示右上角的帮助按钮
    });

    store.Viewer = markRaw(viewer);

    // 默认地形
    store.Viewer.terrainProvider = await Cesium.createWorldTerrainAsync();

    // 抗锯齿
    viewer.scene.postProcessStages.fxaa.enabled = false;

    // 深度测试
    viewer.scene.globe.depthTestAgainstTerrain = true;

    // 初始化鼠标控制器
    store.screenSpaceHandler = markRaw(initHandler(viewer));
};

const restore = () => {
    // 释放控制器
    store.screenSpaceHandler && store.screenSpaceHandler.destroy();

    // 释放场景
    store.Viewer && store.Viewer.destroy();
};

onMounted(() => {
    init();
});

onUnmounted(() => {
    restore();
});
</script>

<style scoped lang="scss">
.baseCesiumViewer {
    position: relative;
    height: 100%;
    #baseCesiumViewer {
        height: 100%;
        width: 100%;
        :deep(.cesium-widget-credits) {
            display: none;
        }
    }
    .baseViewer-toolsBar {
        position: absolute;
        left: 50%;
        bottom: 10px;
        transform: translateX(-50%);
    }
}
</style>
