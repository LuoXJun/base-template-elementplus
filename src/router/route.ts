export const routeConfig: RouteOptions[] = [
    {
        path: '/',
        sort: 0,
        component: 'homePage',
        name: 'homePage',
        type: 'link',
        title: '主页'
    },
    {
        path: 'shader',
        sort: 1,
        component: 'shader',
        name: 'shader',
        type: 'menu',
        title: '着色器',
        children: [
            {
                path: 'radar',
                sort: 0,
                component: 'shader/radar',
                name: 'radar',
                type: 'link',
                title: '雷达特效'
            },
            {
                path: 'flowline',
                sort: 1,
                component: 'shader/flowline',
                name: 'flowline',
                type: 'link',
                title: '流动线特效'
            },
            {
                path: 'rain',
                sort: 2,
                component: 'shader/rain',
                name: 'rain',
                type: 'link',
                title: '下雨后处理'
            },
            {
                path: 'snow',
                sort: 3,
                component: 'shader/snow',
                name: 'snow',
                type: 'link',
                title: '下雪后处理'
            },
            {
                path: 'fog',
                sort: 4,
                component: 'shader/fog',
                name: 'fog',
                type: 'link',
                title: '高度雾'
            },
            {
                path: 'volumeCloud',
                sort: 4,
                component: 'shader/volumeCloud',
                name: 'volumeCloud',
                type: 'link',
                title: '体积云'
            },
            {
                path: 'water',
                sort: 5,
                component: 'shader/water',
                name: 'water',
                type: 'link',
                title: '水特效'
            }
        ]
    }
];
