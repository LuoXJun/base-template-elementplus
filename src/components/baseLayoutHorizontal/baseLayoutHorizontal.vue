<template>
    <div class="baseLayoutHorizontal" v-if="$route.name !== 'homePage'">
        <div class="lxj-header">
            <baseMenuHorizontalHeader />
        </div>
        <div class="lxj-main">
            <div class="lxj-aside" v-if="store.currentMenu.length > 2">
                <el-menu :default-active="$route.path" mode="vertical" router unique-opened>
                    <baseMenuHorizontalAside
                        :list="routes"
                        :parentPath="store.currentMenu.path + '/'"
                    />
                </el-menu>
            </div>
            <div class="lxj-content">
                <router-view></router-view>
            </div>
        </div>
    </div>
    <div class="cesiumContainer" v-else>
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
import baseMenuHorizontalHeader from '../baseMenuHorizontal/baseMenuHorizontalHeader.vue';
import baseMenuHorizontalAside from '../baseMenuHorizontal/baseMenuHorizontalAside.vue';

import { useMenuStore } from '@/stores/useMenuStore';

import { type RouteRecordRaw } from 'vue-router';

const store = useMenuStore();

const routes = ref<RouteRecordRaw[]>([]);

watchEffect(() => {
    if (store.currentMenu.name || store.refreshMenu) {
        const menus =
            store.menu.filter((route) => {
                return route.name === store.currentMenu.name;
            })[0]?.children || [];

        routes.value = store.getRoutes(menus);
        store.refreshMenu = false;
    }
});
</script>

<style lang="scss" scoped>
.baseLayoutHorizontal {
    height: 100%;
    color: #000;
    height: 100%;
    .lxj-header {
        height: $layout-header-height;
        background: rgba(0, 255, 255, 0.214);
    }
    .lxj-main {
        height: calc(100% - $layout-header-height);
        padding: 12px;
        box-sizing: border-box;
        display: flex;
        .lxj-aside {
            flex: $layout-header-aside 0 0;
            margin-right: 12px;
            height: 100%;
        }
        .lxj-content {
            flex: 1 0 0;
            height: 100%;
            padding: 12px;
            box-sizing: border-box;
            background: #e7f1fa;
        }
    }
}
.cesiumContainer {
    height: 100%;
}
</style>
