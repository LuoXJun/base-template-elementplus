<template>
    <div class="baseHorizontalMenuHeader">
        <div class="menuPart">
            <template v-for="menu in menus" :key="menu.name">
                <div v-if="!menu.isHidden" class="lxj-menu-item" @click="goPath(menu)">
                    <span
                        :class="{
                            isSelected: store.currentMenu.path?.includes(menu.path)
                        }"
                    >
                        {{ menu.title }}
                    </span>
                </div>
            </template>
        </div>
        <div class="operation-part">
            <el-button @click="$router.push('/login')">退出登录</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMenuStore } from '@/stores/useMenuStore';
import { useRouter } from 'vue-router';
const router = useRouter();
const store = useMenuStore();

const menus = computed(() => {
    return store.menu.sort((a, b) => {
        return a.sort! - b.sort!;
    });
});

const getRedirect = (menu: RouteOptions, path = '') => {
    path = path ? path + '/' + menu.path : menu.path;

    if (menu.children && menu.children.length > 0) return getRedirect(menu.children[0], path);

    return path;
};

const goPath = (menu: RouteOptions) => {
    const path = getRedirect(menu);

    router.push(path);
};
</script>

<style scoped lang="scss">
.baseHorizontalMenuHeader {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    box-sizing: border-box;
    .menuPart {
        height: 100%;
        display: flex;
        align-items: center;
        flex: 50% 0 0;

        .lxj-menu-item {
            cursor: pointer;
            > span {
                color: #000;
                margin-right: 20px;
                border-radius: 8px;
                display: inline-block;
                padding: 8px 12px;
                &.isSelected {
                    color: $primary;
                }
            }
        }
    }
}
</style>
