import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import cesium from 'vite-plugin-cesium';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        cesium(),
        AutoImport({
            imports: ['vue'],
            resolvers: [ElementPlusResolver()],
            dts: 'src/types/autoImport.d.ts'
        }),
        Components({
            resolvers: [ElementPlusResolver()],
            dts: 'src/types/component.d.ts'
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    base: './',
    define: {
        'process.env': {}
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use '@/styles/globalScss.scss' as *;`
            }
        }
    },
    server: {
        host: true,
        port: 3005,
        hmr: true,
        proxy: {
            '^/user': {
                target: 'http://10.222.125.103:38081/',
                secure: false,
                changeOrigin: true,
                rewrite: (path: string) => {
                    return path.replace(/^\/user/, '');
                }
            }
        }
    }
});
