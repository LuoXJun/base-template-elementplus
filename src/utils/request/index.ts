import { type AxiosResponse } from 'axios';
import BaseRequest from './base_request';
import { TIME_OUT, BASE_URL } from './config/index';
import router from '@/router';
import { MessagePlugin } from 'tdesign-vue-next';

const requestList: any[] = [];
let isRefreshing = false;

const request = new BaseRequest({
    baseURL: BASE_URL,
    timeout: TIME_OUT,
    isLoading: true,
    interceptors: {
        requestIntercepter: (config) => {
            if (config.url?.includes('token')) config.headers.Authorization = '';
            return config;
        },

        requestIntercepterCatch: (err) => {
            if (err.request) {
                MessagePlugin.error(err.request);
            }
            return Promise.reject(err);
        },

        responseIntercepter: (res) => {
            if (res.request.responseType == 'blob') return res;

            if (window.scCode.includes(String(res.data.code))) {
                return res;
            } else {
                if (res.data.msg && res.data.msg.includes('flushToken过期')) router.push('/login');
                MessagePlugin.warning(res.data.message ?? res.data.msg ?? '请求出错');
                return Promise.reject(res) as any as AxiosResponse<ResponseDataType>;
            }
        },

        responseIntercepterCatch: async (err) => {
            switch (err.status) {
                case 201:
                    MessagePlugin.error('Createe');
                    break;
                case 401:
                    // if (location.hash.includes('login')) break;
                    // const { config } = err;

                    // if (isRefreshing) {
                    //     new Promise((resolve) => {
                    //         requestList.push(() => {
                    //             resolve(request.instance.request(config));
                    //         });
                    //     });
                    //     break;
                    // }

                    // isRefreshing = true;
                    // try {
                    //     const { data } = await refreshTokenApi({
                    //         token: sessionStorage.getItem('token'),
                    //         refreshToken: sessionStorage.getItem('refreshToken')
                    //     });
                    //     if (data.code === 200) {
                    //         sessionStorage.setItem('token', data.data.token);
                    //         sessionStorage.setItem('refreshToken', data.data.refreshToken);
                    //     }

                    //     requestList.forEach((request) => request());
                    //     requestList.length = 0;

                    //     request.instance.request(config);
                    // } finally {
                    //     isRefreshing = false;
                    // }
                    break;
                case 403:
                    MessagePlugin.error('Forbidden');
                    break;
                case 404:
                    MessagePlugin.error('404 notFound');
                    break;

                default:
                    MessagePlugin.error(err?.response?.data?.message ?? err?.message ?? err);
            }
            return Promise.reject(err);
        }
    }
});

export default request;
