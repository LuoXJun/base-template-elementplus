<template>
    <div class="base-menu-horizontal-aside">
        <template
            v-for="item in list.sort((a, b) => {
                return (a.meta!.sort as number) - (b.meta!.sort as number);
            })"
            :key="item"
        >
            <el-sub-menu v-if="item.meta?.type == 'menu'" :index="parentPath + item.path">
                <template #title>
                    <span style="padding-left: 10px; box-sizing: border-box">
                        {{ item.meta?.title as string }}
                    </span>
                </template>
                <!-- 组件自递归 -->
                <baseMenuHorizontalAside
                    :list="item.children"
                    :parent-path="parentPath + item.path + '/'"
                ></baseMenuHorizontalAside>
            </el-sub-menu>
            <el-menu-item
                v-if="item.meta?.type == 'link' && item.meta?.isHidden !== true"
                :index="parentPath + item.path"
                :to="parentPath + item.path"
            >
                <span style="padding-left: 10px; box-sizing: border-box">
                    {{ item.meta?.title }}
                </span>
            </el-menu-item>
        </template>
    </div>
</template>
<script setup lang="ts">
import { type PropType } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

// 不想再路由中将路径写成/a/b/c的形式，需要在递归时带上父级路径
const props = defineProps({
    list: {
        type: Object as PropType<RouteRecordRaw[]>,
        default: null
    },
    parentPath: {
        type: String,
        default: ''
    }
});
</script>

<style lang="scss" scoped>
.base-menu-horizontal-aside {
    height: 100%;
}
</style>
