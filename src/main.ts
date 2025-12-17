import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import '@/styles/index.scss';
import 'element-plus/dist/index.css';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import 'cesium/Build/Cesium/Widgets/widgets.css';
import * as Cesium from 'cesium';

window.Cesium = Cesium;
Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1OGZiOGI5Yi0wN2E0LTRlMTgtOTMwYi04NDdhNDg4MTIyNjUiLCJpZCI6MTM1MTU0LCJpYXQiOjE2ODIyNDM3Mjh9.32mOaQTRHc_l41eaI-sTVx4tVODDsrAoAG6Vo_DTL-U';

const pinia = createPinia();

// 需要进行持久化的数据id
const keyVal = {
    menu: 'state' //menu：store注册的id，state：保存在本地时的名称
};
pinia.use(({ store }) => {
    Object.entries(keyVal).forEach(([key, value]) => {
        if (store.$id === key) {
            store.$subscribe((_, state) => {
                sessionStorage.setItem(value, JSON.stringify(state));
            });
        }
    });

    // if (store.$id === 'menu') {
    //     store.$subscribe((_, state) => {
    //         sessionStorage.setItem('state', JSON.stringify(state));
    //     });
    // }
});

const app = createApp(App);
app.use(ElementPlus, {
    locale: zhCn
});
app.use(pinia);
app.use(router);

app.mount('#app');
