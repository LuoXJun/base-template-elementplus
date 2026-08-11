import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useMenuStore } from '@/stores/useMenuStore';

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'login',
        meta: {
            title: '登录'
        },
        component: () => import('@/views/pages/login/index.vue')
    },
    {
        path: '/:pathMatch(.*)',
        name: '404',
        component: () => import('@/views/notFound.vue')
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 };
    }
});

router.beforeEach((to, _, next) => {
    const store = useMenuStore();
    const token = sessionStorage.getItem('token');

    // store.setRecord(to);

    if (to.path === '/login') {
        sessionStorage.clear();
        store.$reset();

        return next();
    }

    if (!token) {
        return to.path !== '/login' ? next('/login') : next();
    }

    // 直接使用会导致本地报警告，打包报错
    // store.currentMenu = to.matched
    if (to.matched.length >= 2) {
        store.currentMenu = {
            length: to.matched.length,
            name: to.matched[1]?.name as string,
            path: to.matched[1]?.path
        };
    }

    /**
     * isNeedUpdate用来控制路由重新注册
     * hasRoue用来防止路由没有注册成功的情况，即便这种情况不应该会发生
     * */
    if (store.isNeedUpdate || !router.hasRoute('layout')) {
        store.setRoute(store.getRoutes(store.menu));
        store.$patch((state) => {
            state.isNeedUpdate = false;
        });
        return next(to.fullPath);
    }
    return next();
});

export default router;
