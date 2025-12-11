<template>
    <div class="baseLayoutVertical">
        <div class="lxj-header">顶部导航栏</div>
        <div class="lxj-main">
            <div class="lxj-aside">
                <el-menu :default-active="$route.path" mode="vertical" router unique-opened>
                    <baseMenuHorizontalAside :list="store.getRoutes(store.menu)" />
                </el-menu>
            </div>
            <div class="lxj-content">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import baseMenuHorizontalAside from '../baseMenuHorizontal/baseMenuHorizontalAside.vue';

import { useMenuStore } from '@/stores/useMenuStore';

const store = useMenuStore();
</script>

<style scoped lang="scss">
.baseLayoutVertical {
    height: 100%;
    color: #000;
    height: 100%;
    .lxj-header {
        height: $layout-header-height;
        background: rgba(0, 255, 255, 0.214);
        display: flex;
        align-items: center;
        padding: 0 12px;
    }
    .lxj-main {
        height: calc(100% - $layout-header-height);
        padding: 12px;
        box-sizing: border-box;
        display: flex;
        background: #e7f1fa;
        .lxj-aside {
            flex: $layout-header-aside 0 0;
            margin-right: 12px;
            height: 100%;
            :deep(.el-menu) {
                height: 100%;
            }
        }
        .lxj-content {
            flex: 1 0 0;
            height: 100%;
            padding: 12px;
            box-sizing: border-box;
            background: rgba(0, 255, 255, 0.077);
        }
    }
}
</style>
