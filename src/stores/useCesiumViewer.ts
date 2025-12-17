import { screenSpaceEventTypeKeyvalue } from '@/enum/cesium.enum';
import { defineStore } from 'pinia';

export const useCesiumViewer = defineStore('useCesiumViewer', {
    state() {
        return {
            Viewer: <Cesium.Viewer | null>null,
            screenSpaceHandler: <Cesium.ScreenSpaceEventHandler | null>null,
            screenEvent: <Record<ScreenSpaceEventTypeKey, any>>{}
        };
    },
    actions: {
        /**获取当前事件并保存，销毁后返回空的控制器*/
        getScreenSpaceHandler() {
            const keys = Object.keys(
                screenSpaceEventTypeKeyvalue
            ) as Array<ScreenSpaceEventTypeKey>;

            keys.forEach((key) => {
                // 保存当前存在的事件，保证同时只存在一个相同的事件
                const eve = this.screenSpaceHandler?.getInputAction(
                    screenSpaceEventTypeKeyvalue[key]
                );
                if (eve) this.screenEvent[key] = eve;

                this.screenSpaceHandler?.removeInputAction(screenSpaceEventTypeKeyvalue[key]);
            });

            return this.screenSpaceHandler!;
        },

        /**事件结束后释放当前事件并还原上一事件，目前暂不做队列管理，仅做单一控制*/
        restoreScreenSpaceHandler() {
            const keys = Object.keys(
                screenSpaceEventTypeKeyvalue
            ) as Array<ScreenSpaceEventTypeKey>;

            for (const key of keys) {
                this.screenSpaceHandler?.removeInputAction(screenSpaceEventTypeKeyvalue[key]);
                if (this.screenEvent[key]) {
                    this.screenSpaceHandler?.setInputAction(
                        this.screenEvent[key],
                        screenSpaceEventTypeKeyvalue[key]
                    );
                }
            }
        }
    }
});
