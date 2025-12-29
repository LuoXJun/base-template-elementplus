import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useMenuStore } from '@/stores/useMenuStore';
import { stringifyQuery, parseQuery } from './encodeQuery';

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
    },
    stringifyQuery,
    parseQuery
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

    if (!token) return to.path !== '/login' ? next('/login') : next();

    store.currentMenu = {
        length: to.matched.length,
        name: to.matched[1]?.name as string,
        path: to.matched[1]?.path
    };

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
