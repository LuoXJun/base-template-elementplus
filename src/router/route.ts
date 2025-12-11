export const routeConfig: RouteOptions[] = [
    {
        path: '/',
        sort: 0,
        component: 'aa-useCase',
        name: 'useCase',
        type: 'link',
        title: '组件使用案例'
    },
    {
        path: '/c',
        sort: 2,
        component: 'c',
        name: 'C',
        type: 'menu',
        title: '多级菜单/C',
        children: [
            {
                path: 'c1',
                sort: 0,
                component: 'c1',
                name: 'C1',
                type: 'menu',
                title: 'c1',
                children: [
                    {
                        path: 'c11',
                        sort: 0,
                        component: 'c11',
                        name: 'C11',
                        type: 'menu',
                        title: 'c11',
                        children: [
                            {
                                path: 'c111',
                                sort: 0,
                                component: 'c111',
                                name: 'C111',
                                type: 'link',
                                title: 'c111'
                            },
                            {
                                path: 'c112',
                                sort: 0,
                                component: 'c112',
                                name: 'C112',
                                type: 'link',
                                title: 'c112'
                            }
                        ]
                    },
                    {
                        path: 'd',
                        sort: 0,
                        component: 'd',
                        name: 'd',
                        type: 'link',
                        title: 'd'
                    }
                ]
            }
        ]
    }
];
