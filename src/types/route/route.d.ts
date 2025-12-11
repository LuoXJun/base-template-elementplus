interface RouteOptions {
    path: string;
    name: string;
    /**路径默认为  views/pages/**\/index.vue;不同的path不能使用相同的component  */
    component: string;
    // menu作为父级，link作为内容页，当类型为menu时，children一定要有
    type: 'menu' | 'link';
    title: string;
    sort?: number;
    /**
     * .name.jpg，资源路径由utils/getAssets.ts拼接
     * 或者直接使用element图标库图标，区分大小写
     * */
    icon?: string;
    // 是否隐藏菜单
    isHidden?: boolean;
    redirect?: string;
    children?: RouteOptions[];
}
