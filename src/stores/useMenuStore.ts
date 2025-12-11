import { defineStore } from 'pinia';
import { type RouteLocationNormalizedGeneric, type RouteRecordRaw, RouterView } from 'vue-router';
import Layout from '@/views/index.vue';
import router from '@/router';
const views = import.meta.glob('@/views/pages/**/index.vue');
const Null = import.meta.glob('@/views/Null.vue');

interface UseMenu {
    // 没有被处理过的原始路由表
    menu: RouteOptions[];
    /**更新路由*/
    isNeedUpdate: boolean;
    /**更新菜单,路由和显示的菜单并不总是同时更新，所以单独控制*/
    refreshMenu: boolean;
    isCollapse: boolean;
    records: { path: string; title: string }[];
    currentMenu: { name: string; path: string; length: number };
}

const getState = () => {
    const storageState = <UseMenu>JSON.parse(sessionStorage.getItem('state') as string);
    if (storageState) storageState.isNeedUpdate = true;
    const state =
        storageState ||
        <UseMenu>{
            menu: [],
            isNeedUpdate: true,
            refreshMenu: true,
            isCollapse: false,
            records: [],
            currentMenu: {
                name: '',
                path: '',
                length: 0
            }
        };
    return state;
};

export const useMenuStore = defineStore('menu', {
    state: getState,
    actions: {
        // 将原始路由表转为vue-router的支持格式
        getRoutes(menus: RouteOptions[]) {
            const routes: RouteRecordRaw[] = [];
            for (const menu of menus) {
                // 作为父级存在且没有子级时隐藏
                if (menu.type === 'menu' && (!menu.children || menu.children.length === 0))
                    continue;
                // 作为页面级别时且被隐藏是不注册----也就是 子级显隐不受父级影响
                if (menu.type === 'link' && menu.isHidden) continue;
                const obj: RouteRecordRaw = {
                    path: menu.path,
                    name: menu.name,
                    redirect: menu.redirect ?? '',
                    component:
                        menu.type === 'menu'
                            ? RouterView
                            : views[`/src/views/pages/${menu.component}/index.vue`] ||
                              Null[`/src/views/Null.vue`],
                    meta: {
                        sort: menu.sort ?? 0,
                        icon: menu.icon,
                        title: menu.title,
                        type: menu.type,
                        isHidden: menu.isHidden || false
                    },
                    children: []
                };

                if (menu.type === 'menu') {
                    obj.children.push(...this.getRoutes(menu.children!));
                }
                routes.push(obj);
            }

            return routes;
        },
        setRoute(routes: RouteRecordRaw[]) {
            const layout: RouteRecordRaw = {
                path: '/',
                name: 'layout',
                // redirect: '/horizontal',
                meta: {
                    title: '首页'
                },
                component: Layout,
                children: []
            };
            routes.forEach((route) => {
                layout.children.push(route);
            });
            router.addRoute(layout);
        },
        setRecord(path: RouteLocationNormalizedGeneric) {
            // 防止随意输入地址后被保存在记录中
            if (!path.meta?.title) return;
            this.records.forEach((item, index) => {
                if (item.path === path.path) {
                    this.records.splice(index, 1);
                }
            });
            // 只保留10条记录
            if (this.records.length === 10) {
                this.records.shift();
            }
            this.records.push({
                path: path.path,
                title: path.meta?.title
            });
        }
    }
});
