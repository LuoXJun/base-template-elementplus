import 'vue-router';

declare module 'vue-router' {
    interface RouteMeta {
        title?: string;
        type?: 'link' | 'menu' | 'other';
        isHidden?: boolean;
        icon?: string;
        component?: string;
        // 是否被设置为routerview，按钮级别和详情页
        isRouterView?: boolean;
    }
}
