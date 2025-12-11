import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosPromise } from 'axios';
// @ts-ignore
import qs from 'qs';
import { LoadingPlugin, type LoadingInstance } from 'tdesign-vue-next';

class BaseRequest {
    instance: AxiosInstance;
    interceptors?: IbaseRequestConfig;
    // 接受实例化的loading对象
    loading: LoadingInstance | undefined;
    // 是否显示加载
    isLoading: boolean;

    constructor(config: IbaseInstanceConfig) {
        this.instance = axios.create(config);
        this.interceptors = config.interceptors;
        this.isLoading = config.isLoading ?? true;

        /**
         * 同一个实例添加多个拦截器会按顺序执行而不是覆盖
         * 请求拦截 a,b,c--->c,b,a 按添加的顺序倒叙执行
         * 响应拦截 a,b,c--->a,b,c  按添加的顺序执行
         * */
        this.commonResponseInterceptor();

        // 需要自定义拦截器时自己传进来
        if (this.interceptors) {
            // 使用实例请求拦截
            this.instance.interceptors.request.use(
                this.interceptors?.requestIntercepter,
                this.interceptors?.requestIntercepterCatch
            );

            // 使用实例响应拦截
            this.instance.interceptors.response.use(
                this.interceptors?.responseIntercepter,
                this.interceptors?.responseIntercepterCatch
            );
        }
        this.commonRequestInterceptor();
    }
    // 共有请求拦截器
    private commonRequestInterceptor = () => {
        this.instance.interceptors.request.use(
            (config) => {
                // add token
                const token = sessionStorage.getItem('token');
                if (token && config.headers) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },
            (err) => {
                return Promise.reject(err);
            }
        );
    };

    // 共有响应拦截
    private commonResponseInterceptor = () => {
        this.instance.interceptors.response.use(
            (res: AxiosResponse<ResponseDataType>) => {
                this.loading?.hide();
                if (res.request.responseType == 'blob') {
                    const size = res.headers['content-length'];
                    let name = res.headers['content-disposition'] ?? '';
                    if (name) {
                        const arr = name.split('filename=');
                        name = arr.pop() ?? '';
                    }

                    return {
                        responseType: 'blob',
                        size,
                        name,
                        data: res.data,
                        config: res.config,
                        status: res.status,
                        statusText: res.statusText,
                        headers: res.headers
                    };
                }
                return res;
            },
            (err) => {
                this.loading?.hide();
                return Promise.reject(err);
            }
        );
    };

    // 实例化每个请求的拦截
    request(config: IbaseInstanceConfig): AxiosPromise<ResponseDataType> {
        // 发送请求时控制是否显示加载框
        this.isLoading = config.isLoading ?? true;
        // 发起请求时调用加载
        if (this.isLoading) {
            this.loading = LoadingPlugin({
                fullscreen: true,
                attach: 'body',
                preventScrollThrough: true,
                text: config.loadingText ?? '加载中...'
            });
        }
        return new Promise((resolve, reject) => {
            if (config.interceptors?.requestIntercepter) {
                // @ts-ignore
                config = config.interceptors.requestIntercepter(config);
            }

            const params = config.params || {};
            if (config.method?.toUpperCase() === 'GET' && params) {
                config.params = {};
                const paramsStr = qs.stringify(params, { allowDots: true });
                if (paramsStr) {
                    config.url = config.url + '?' + paramsStr;
                }
            }

            this.instance.request<ResponseDataType>(config).then(
                (res) => {
                    if (config.interceptors?.responseIntercepter) {
                        res = config.interceptors.responseIntercepter(res);
                    }
                    resolve(res);
                },
                (err) => {
                    reject(err?.response ?? err);
                }
            );
        });
    }

    post(url: string, data: Record<string, any> = {}, config?: IbaseInstanceConfig) {
        return this.request({
            url,
            method: 'POST',
            data,
            ...config
        });
    }

    put(url: string, data: Record<string, any> = {}, config?: IbaseInstanceConfig) {
        return this.request({
            url,
            method: 'put',
            data,
            ...config
        });
    }

    get(url: string, data: Record<string, any> = {}, config?: IbaseInstanceConfig) {
        return this.request({
            url,
            method: 'GET',
            params: data,
            ...config
        });
    }

    delete(url: string, data: Record<string, any> = {}, config?: IbaseInstanceConfig) {
        return this.request({
            url,
            method: 'delete',
            params: data,
            ...config
        });
    }

    blob(url: string, data: Record<string, any> = {}, config?: IbaseInstanceConfig) {
        return this.request({
            url,
            method: 'GET',
            params: data,
            responseType: 'blob',
            ...config
        });
    }
}
export default BaseRequest;
